const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require("@aws-sdk/client-cloudfront");

const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
require("dotenv").config();

const cloudfront = new CloudFrontClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function createInvalidation(objectName) {
  const command = new CreateInvalidationCommand({
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: objectName,
      Paths: {
        Quantity: 1,
        Items: ["/" + objectName],
      },
    },
  });
  return await cloudfront.send(command);
}

async function getPrivateKeySignedUrl({ objectName }) {
  return getSignedUrl({
    url: `https://${process.env.S3_CHAT_BUCKET_CDN_DOMAIN}/${objectName}`,
    privateKey: process.env.CLOUDFRONT_CHAT_PRIVATE_KEY,
    keyPairId: process.env.CLOUDFRONT_CHAT_KEY_PAIR_ID,
    dateLessThan: new Date(Date.now() + 60 * 60 * 1000),
  });
}

module.exports = { createInvalidation, getPrivateKeySignedUrl};
