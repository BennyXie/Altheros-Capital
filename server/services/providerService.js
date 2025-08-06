const { db } = require("../db/pool");
require("dotenv").config({ path: "./.env" });

const updateProviderHeadshot = async (cognitoSub, imageUrl) => {
  const result = await pool.query(
    "SELECT id FROM providers WHERE cognito_sub = $1",
    [cognitoSub]
  );

  if (result.rows.length === 0) {
    throw new Error("Provider not found");
  }

  const providerId = result.rows[0].id;

  await pool.query(
    "UPDATE providers SET headshot_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
    [imageUrl, providerId]
  );
};

async function listProviders() {
  // GET /providers?page=1&limit=10&gender=male&sort_by=last_name&order=desc
  const fields = [
    "provider_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "address",
    "gender",
    "bio",
  ];
  const sortable_fields = ["first_name", "last_name", "provider_id"];
  const { language, specialty, gender } = req.query;
  const field_list = fields.join(", ");
  const sort_by = req.query.sort_by;
  const order = (req.query.order || "asc").toUpperCase();

  // pagination, defaults to first page with 10 showing on each page
  // offset is determined by the page and limit
  // i.e. if on page 1 -> skips 0
  // i.e. if on page 3 -> skips 20 items
  const page_num = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page_num - 1) * limit;

  const filters = ["is_active = true"];
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
    order_by_clause = "ORDER BY provider_id ASC";
  }

  const count_query = `SELECT COUNT(*) FROM providers ${where_clause}`;
  const count_result = await db.query(count_query, values); // produces [{ count: '10' }]
  const total_records = parseInt(count_result.rows[0].count);

  const sql_query = `SELECT ${field_list} FROM providers ${where_clause} ${order_by_clause} LIMIT $${
    values.length + 1
  } OFFSET $${values.length + 2}`;
  values.push(offset);
  values.push(limit);
  const data = await db.query(sql_query, values);

  const has_next_page = page_num * limit < total_records;
  const has_prev_page = page_num > 1;

  return {
    providers: providersWithSignedUrls,
    page_num: 1,
    limit: providersWithSignedUrls.length,
    totalPages: 1,
    totalRecords: providersWithSignedUrls.length,
    hasNextPage: false,
    hasPrevPage: false,
    nextRoute: null,
    prevRoute: null,
  };
}

async function getProvider(providerId) {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, address, gender, bio 
     FROM providers 
     WHERE id = $1`,
    [providerId]
  );
  return result.rows[0];
}

async function getProviderHeadshotUrl(providerId) {
  // First, get the provider's headshot URL from the database
  const result = await pool.query(
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
  const result = await pool.query(
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
