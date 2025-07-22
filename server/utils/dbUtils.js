const db = require("../db/pool.js");

async function getUserDbId(decoded) {
  const { sub } = decoded;
  const groups = decoded["cognito:groups"];
  const role = groups && groups[0];
  if (!["providers", "patients"].includes(role)) {
    throw new Error("Invalid db role");
  }
  const query = role
    ? `SELECT id FROM ${role} WHERE cognito_sub = $1`
    : `SELECT id FROM providers WHERE cognito_sub = $(sub) UNION SELECT id FROM patients WHERE cognito_sub = $1`;
  const result = await db.oneOrNone(query, [sub]);
  return result.rows[0].id;
}

module.exports = { getUserDbId };
