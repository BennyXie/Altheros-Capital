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

async function listProviders() {
  // GET /providers?page=1&limit=10&gender=male&sort_by=last_name&order=desc
  const fields = [
    "provider_id",
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "address",
    "gender",
    "bio",
  ];
  const sortable_fields = ["first_name", "last_name", "provider_id"];
  const { language, specialty, gender } = req.query;
  const field_list = fields.join(", ");
  const sort_by = req.query.sort_by;
  const order = (req.query.order || "asc").toUpperCase();

  // pagination, defaults to first page with 10 showing on each page
  // offset is determined by the page and limit
  // i.e. if on page 1 -> skips 0
  // i.e. if on page 3 -> skips 20 items
  const page_num = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page_num - 1) * limit;

  const filters = ["is_active = true"];
  const values = [];

  if (language) {
    filters.push(`language=${values.length + 1}`);
    values.push(language);
  }

  if (specialty) {
    filters.push(`specialty=${values.length + 1}`);
    values.push(specialty);
  }

  if (gender) {
    filters.push(`gender=${values.length + 1}`);
    values.push(gender);
  }

  const where_clause =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  let order_by_clause = "";
  if (sort_by && sortable_fields.includes(sort_by)) {
    order_by_clause = `ORDER BY ${sort_by} ${
      order === "DESC" ? "DESC" : "ASC"
    }`;
  } else {
    // defaults sort order if not specified or not valid field to sort by
    order_by_clause = "ORDER BY provider_id ASC";
  }

  const count_query = `SELECT COUNT(*) FROM providers ${where_clause}`;
  const count_result = await db.query(count_query, values); // produces [{ count: '10' }]
  const total_records = parseInt(count_result.rows[0].count);

  const sql_query = `SELECT ${field_list} FROM providers ${where_clause} ${order_by_clause} LIMIT $${
    values.length + 1
  } OFFSET $${values.length + 2}`;
  values.push(offset);
  values.push(limit);
  const data = await db.query(sql_query, values);

  const has_next_page = page_num * limit < total_records;
  const has_prev_page = page_num > 1;

  return {
    providers: data.rows,
    page_num,
    limit,
    totalPages: Math.ceil(total / limit),
    totalRecords: total_records,
    hasNextPage: has_next_page,
    hasPrevPage: has_prev_page,
    nextRoute: has_next_page
      ? `/providers?page=${page_num + 1}&limit=${limit}`
      : null,
    prevRoute: has_prev_page
      ? `/providers?page=${page_num - 1}&limit=${limit}`
      : null,
  };
}

async function getProvider(providerId) {
  const result = db.query(
    `SELECT * 
       FROM providers 
       WHERE provider_id = $1 AND is_active = true`,
    [providerId]
  );
  return result.rows[0];
}

module.exports = {
  updateProviderHeadshot,
  listProviders,
  getProvider,
};
