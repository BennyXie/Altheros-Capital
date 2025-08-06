const db = require("../db/pool");
const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config({ path: "./.env" });

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const updateProviderHeadshot = async (cognitoSub, imageUrl) => {
  const result = await db.query(
    "SELECT id FROM providers WHERE cognito_sub = $1",
    [cognitoSub]
  );

  if (result.rows.length === 0) {
    throw new Error("Provider not found");
  }

  const providerId = result.rows[0].id;

  await db.query(
    "UPDATE providers SET headshot_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
    [imageUrl, providerId]
  );
};

async function listProviders(reqObj) {
  console.log('providerService: listProviders called');
  console.log('providerService: reqObj parameter:', !!reqObj);
  console.log('providerService: reqObj type:', typeof reqObj);
  
  // Safely extract query parameters
  const query = (reqObj && reqObj.query) ? reqObj.query : {};
  console.log('providerService: extracted query:', query);
  
  // GET /providers?page=1&limit=10&gender=male&sort_by=last_name&order=desc
  const fields = [
    "id",
    "first_name",
    "last_name",
    "email",
    "gender",
    "specialty",
    "education",
    "experience_years",
    "about_me",
    "location",
    "headshot_url",
    "cognito_sub",
    "hobbies",
    "languages",
    "insurance_networks"
  ];
  const sortable_fields = ["first_name", "last_name", "id"];
  
  const { language, specialty, gender } = query;
  const field_list = fields.join(", ");
  
  const sort_by = query.sort_by;
  const order = (query.order || "asc").toUpperCase();

  // pagination, defaults to first page with 10 showing on each page
  const page_num = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page_num - 1) * limit;

  const filters = [];
  const values = [];

  if (language) {
    filters.push(`language = $${values.length + 1}`);
    values.push(language);
  }

  if (specialty) {
    filters.push(`specialty = $${values.length + 1}`);
    values.push(specialty);
  }

  if (gender) {
    filters.push(`gender = $${values.length + 1}`);
    values.push(gender);
  }

  const where_clause =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  let order_by_clause = "";
  if (sort_by && sortable_fields.includes(sort_by)) {
    order_by_clause = `ORDER BY ${sort_by} ${
      order === "DESC" ? "DESC" : "ASC"
    }`;
  } else {
    // defaults sort order if not specified or not valid field to sort by
    order_by_clause = "ORDER BY id ASC";
  }

  const count_query = `SELECT COUNT(*) FROM providers ${where_clause}`;
  const count_result = await db.query(count_query, values); // produces [{ count: '10' }]
  const total_records = parseInt(count_result.rows[0].count);

  const sql_query = `SELECT ${field_list} FROM providers ${where_clause} ${order_by_clause} LIMIT $${
    values.length + 1
  } OFFSET $${values.length + 2}`;
  values.push(limit);
  values.push(offset);
  const data = await db.query(sql_query, values);

  // Process providers to generate presigned URLs for S3 headshots
  const providersWithSignedUrls = await Promise.all(data.rows.map(async (provider) => {
    if (provider.headshot_url) {
      // Check if the URL looks like an S3 URL
      if (provider.headshot_url.includes('s3.amazonaws.com') || (process.env.S3_BUCKET_NAME && provider.headshot_url.includes(process.env.S3_BUCKET_NAME))) {
        try {
          let key = provider.headshot_url;
          if (key.startsWith('http')) {
            const urlParts = new URL(key);
            key = urlParts.pathname.substring(1); // Remove leading slash
          }

          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
          });
          const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 }); // 10 minutes
          return { ...provider, headshot_url: presignedUrl };
        } catch (error) {
          console.error(`Error generating presigned URL for ${provider.id}:`, error);
          return { ...provider, headshot_url: null }; // Return null if error
        }
      } else {
        // If it's not an S3 URL, return it as is (frontend will handle fallback)
        return provider;
      }
    }
    return provider;
  }));

  const has_next_page = page_num * limit < total_records;
  const has_prev_page = page_num > 1;
  const total_pages = Math.ceil(total_records / limit);

  return {
    providers: providersWithSignedUrls,
    page_num: page_num,
    limit: limit,
    totalPages: total_pages,
    totalRecords: total_records,
    hasNextPage: has_next_page,
    hasPrevPage: has_prev_page,
    nextRoute: has_next_page ? `/api/providers?page=${page_num + 1}&limit=${limit}` : null,
    prevRoute: has_prev_page ? `/api/providers?page=${page_num - 1}&limit=${limit}` : null,
  };
}

async function getProvider(providerId) {
  const result = await db.query(
    `SELECT id, first_name, last_name, email, address, gender, bio 
     FROM providers 
     WHERE id = $1`,
    [providerId]
  );
  return result.rows[0];
}

async function getProviderHeadshotUrl(providerId) {
  // First, get the provider's headshot URL from the database
  const result = await db.query(
    `SELECT headshot_url FROM providers WHERE id = $1`,
    [providerId]
  );

  if (result.rows.length === 0) {
    throw new Error("Provider not found");
  }

  const headshotUrl = result.rows[0].headshot_url;
  
  if (!headshotUrl) {
    throw new Error("Provider does not have a headshot uploaded");
  }

  // Extract the S3 key from the URL
  // URL format: https://bucket-name.s3.region.amazonaws.com/headshots/providerId.extension
  const urlParts = headshotUrl.split('/');
  const key = urlParts.slice(3).join('/'); // Skip https://, bucket-name.s3.region.amazonaws.com/

  // Create a GetObject command
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  // Generate pre-signed URL that expires in 10 minutes (600 seconds)
  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  return presignedUrl;
}

async function getProviderProfileByCognitoSub(cognitoSub) {
  const result = await db.query(
    `SELECT * FROM providers WHERE cognito_sub = $1`,
    [cognitoSub]
  );
  return result.rows[0];
}

module.exports = {
  updateProviderHeadshot,
  listProviders,
  getProvider,
  getProviderHeadshotUrl,
  getProviderProfileByCognitoSub,
};
