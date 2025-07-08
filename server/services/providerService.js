const pool = require("../db/pool");

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

module.exports = { updateProviderHeadshot };
