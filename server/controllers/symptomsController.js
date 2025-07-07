// const db = require();   

async function getSymptoms() {
  const { rows } = await db.query(
    'SELECT * FROM symptoms ORDER BY name'
  );
  return rows;               
}

module.exports = { getSymptoms };