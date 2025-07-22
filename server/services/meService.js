const db = require('../db/pool.js');

async function getUserProfile(userId, role) {
  const table = role === 1 ? 'patients' : 'providers';
  const idField = role === 1 ? 'patient_id' : 'provider_id';

  const data = await db.one(
    `SELECT first_name, last_name, email FROM ${table} WHERE ${idField} = $1`,
    [userId]
  );

  return {
    id: userId,
    name: `${data.first_name} ${data.last_name}`,
    email: data.email,
    role: role === 1 ? 'patient' : 'provider',
    profile: {} // fill in later
  };
}

async function updateUserProfile(userId, role, updates) {
  const allowedFields = ['first_name', 'last_name', 'bio', 'address', 'dob'];
  const filtered = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filtered[field] = updates[field];
    }
  }

  if (Object.keys(filtered).length === 0) {
    throw new Error('No valid fields to update');
  }

  const setClauses = Object.keys(filtered)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

  const values = Object.values(filtered);
  values.push(userId);

  const table = role === 1 ? 'patients' : 'providers';
  const idField = role === 1 ? 'patient_id' : 'provider_id';

  const query = `
    UPDATE ${table}
    SET ${setClauses}
    WHERE ${idField} = $${values.length}
    RETURNING *
  `;

  return db.one(query, values);
}

async function deleteUser(userId, role) {
  const table = role === 1 ? 'patients' : 'providers';
  const idField = role === 1 ? 'patient_id' : 'provider_id';

  const result = await db.result(
    `DELETE FROM ${table} WHERE ${idField} = $1`,
    [userId]
  );

  return result.rowCount > 0;
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUser
};
