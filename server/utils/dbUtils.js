const db = require("../db/pool.js");

async function getUserDbId(decoded) {
  const { sub } = decoded;
  const groups = decoded["cognito:groups"];
  const role = groups && groups[0];
  console.log("dbUtils: getUserDbId - Decoded sub:", sub);
  console.log("dbUtils: getUserDbId - Role:", role);

  if (!["providers", "patients"].includes(role)) {
    throw new Error("Invalid db role");
  }
  const query = role
    ? `SELECT id FROM ${role} WHERE cognito_sub = $1`
    : `SELECT id FROM providers WHERE cognito_sub = $1 UNION SELECT id FROM patients WHERE cognito_sub = $1`;
  const result = await db.query(query, [sub]);
  if (result.rows.length > 0) {
    return sub; // Return the cognito_sub (UUID) directly
  } else {
    return null; // Return null if no user is found
  }
}

module.exports = { getUserDbId };
