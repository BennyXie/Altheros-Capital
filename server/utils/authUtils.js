async function getUserDbId(decoded) {
  const { sub } = decoded;
  const groups = decoded["cognito:groups"];
  const role = groups && groups[0];
  const query = role
    ? `SELECT id FROM $(role) WHERE cognito_sub = $(sub)`
    : `SELECT id FROM providers WHERE cognito_sub = $(sub) UNION SELECT id FROM patients WHERE cognito_sub = $(sub)`;
  const result = await db.oneOrNone(query, { role: role, sub: sub });
  return result["id"];
}

module.exports = { getUserDbId };
