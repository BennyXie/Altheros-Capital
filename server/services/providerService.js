const pool = require("../db/pool");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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

async function listProviders(queryParams) {
  const data = await pool.query(`SELECT * FROM providers`);

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
          return { ...provider, headshot_url: null }; // Return null or original if error
        }
      } else {
        // If it's not an S3 URL, return it as is (frontend will handle fallback)
        return provider;
      }
    }
    return provider;
  }));

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
