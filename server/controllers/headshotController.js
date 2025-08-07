const { uploadToS3 } = require("../services/s3Service");
const { updateProviderHeadshot } = require("../services/providerService");

const uploadHeadshot = async (req, res) => {
  console.log("uploadHeadshot controller - req.file:", req.file);
  console.log("uploadHeadshot controller - req.user.sub:", req.user?.sub);
  try {
    const file = req.file;
    const cognitoSub = req.user.sub;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const extension = file.mimetype.split("/")[1];
    const key = `headshots/${cognitoSub}.${extension}`;

    const imageUrl = await uploadToS3({
      fileBuffer: file.buffer,
      key: key,
      mimeType: file.mimetype,
      bucketName: process.env.S3_BUCKET_NAME,
    });
    await updateProviderHeadshot(cognitoSub, imageUrl);

    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("Headshot upload failed:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};

module.exports = { uploadHeadshot };