const { uploadHeadshotToS3 } = require("../services/s3Uploader");

const uploadHeadshot = async (req, res) => {
  console.log("uploadHeadshot controller - req.file:", req.file);
  console.log("uploadHeadshot controller - req.user.sub:", req.user?.sub);
  try {
    const file = req.file;
    const cognitoSub = req.user.sub;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = await uploadHeadshotToS3(file.buffer, cognitoSub, file.mimetype);

    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("Headshot upload failed:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};

module.exports = { uploadHeadshot };