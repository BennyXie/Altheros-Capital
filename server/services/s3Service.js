const {
  S3Client,
  PutObjectCommand,
  GetObjectAclCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-s3/");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async ({ fileBuffer, key, mimeType, bucketName }) => {
  const putObjectCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3.send(putObjectCommand);

  return `https://${bucketName}.s3.amazonaws.com/${key}`;
};

const getFromS3 = async ({ key, bucketName }) => {
  const getObjectCommand = new GetObjectAclCommand({
    Bucket: bucketName,
    key: key,
  });

  return await getSignedUrl(s3, getObjectCommand, {
    expiresIn: 7 * 24 * 60 * 60, //7 days
  });
};
module.exports = { s3, uploadToS3, getFromS3 };
