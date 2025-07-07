// const db = require();

async function getLanguages() {
  const { rows } = await db.query(
    'SELECT * FROM languages ORDER BY name'
  );
  return rows;          
}

module.exports = { getLanguages };