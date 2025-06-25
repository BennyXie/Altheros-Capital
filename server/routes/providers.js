const express = require('express')
const router = express.Router()

const pgp = require('pg-promise')(/* options */)
const db = pgp({
  host: 'midwest-health-db.cle2oqga6j1x.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'postgres',
  user: 'mwh_admin',
  password: 'your_password_here',
  ssl: { rejectUnauthorized: false },
});


/* 
  GET /providers (can filter by language, specialty, gender)

    Returns provider info from DB: 
      { provider_id, first_name, last_name, email, phone_number, address, gender, bio }
    Uses API Pagination 
    Allows sorting (by only one field) (default sorting is by provider_id ascending)
      allowable fields to sort by 'first_name', 'last_name', 'provider_id'
    Only returns active providers (is_active=true)

*/


router.get('/', async (req, res) => {
  // GET /providers?page=1&limit=10&gender=male&sort_by=last_name&order=desc
  const fields = ['provider_id', 'first_name', 'last_name', 'email', 'phone_number', 'address', 'gender', 'bio']
  const sortable_fields = ['first_name', 'last_name', 'provider_id'];

  try {
    const { language, specialty, gender } = req.query
    const field_list = fields.join(', ');
    const sort_by = req.query.sort_by;
    const order = (req.query.order || 'asc').toUpperCase();

    // pagination, defaults to first page with 10 showing on each page
    // offset is determined by the page and limit
    // i.e. if on page 1 -> skips 0
    // i.e. if on page 3 -> skips 20 items
    const page_num = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page_num - 1) * limit

    const filters = ['is_active = true'];
    const values = [];

    if (language) {
      filters.push(`language=${values.length + 1}`)
      values.push(language)
    }

    if (specialty) {
      filters.push(`specialty=${values.length + 1}`)
      values.push(specialty)
    }

    if (gender) {
      filters.push(`gender=${values.length + 1}`)
      values.push(gender)
    }


    const where_clause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    let order_by_clause = '';
    if (sort_by && sortable_fields.includes(sort_by)) {
      order_by_clause = `ORDER BY ${sort_by} ${order === 'DESC' ? 'DESC' : 'ASC'}`;
    } else {
      // defaults sort order if not specified or not valid field to sort by
      order_by_clause = 'ORDER BY provider_id ASC';
    }


    const count_query = `SELECT COUNT(*) FROM providers ${where_clause}`;
    const count_result = await db.query(count_query, values); // produces [{ count: '10' }]
    const total_records = parseInt(count_result.rows[0].count);


    const sql_query = `SELECT ${field_list} FROM providers ${where_clause} ${order_by_clause} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`
    values.push(offset)
    values.push(limit)
    const data = await db.query(sql_query, values)


    const has_next_page = page_num * limit < total_records;
    const has_prev_page = page_num > 1;

    res.json({
      providers: data.rows,
      page_num,
      limit,
      totalPages: Math.ceil(total / limit),
      totalRecords: total_records,
      hasNextPage: has_next_page,
      hasPrevPage: has_prev_page,
      nextRoute: has_next_page ? `/providers?page=${page_num + 1}&limit=${limit}` : null,
      prevRoute: has_prev_page ? `/providers?page=${page_num - 1}&limit=${limit}` : null
    });


  } catch (err) {
    // TODO
    console.error('DB error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }

})



/* 
  GET /providers/:id (gets info of single provider)
    Returns provider info from DB
*/
router.get('/:id', (req, res) => {
  // TODO 

  try {
    // TODO 
  } catch (err) {
    // TODO
  }

})


module.exports = router;