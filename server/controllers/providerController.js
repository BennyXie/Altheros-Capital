const providerService = require('../services/providerService');

/* 
  GET /providers (can filter by language, specialty, gender)

    Returns provider info from DB: 
      { provider_id, first_name, last_name, email, phone_number, address, gender, bio }
    Uses API Pagination 
    Allows sorting (by only one field) (default sorting is by provider_id ascending)
      allowable fields to sort by 'first_name', 'last_name', 'provider_id'
    Only returns active providers (is_active=true)

*/
async function listProviders(req, res) {
  try {
    // GET /providers?page=1&limit=10&gender=male&sort_by=last_name&order=desc
    const {
      language: language,
      specialty: specialty,
      gender: gender,
      sort_by: sortBy,
      order: sortOrder,
      page: page,
      limit: limit
    } = req.query;

    const result = await providerService.listProviders({
      language,
      specialty,
      gender,
      sortBy,
      sortOrder,
      page,
      limit
    });

    res.json({
      providers: result.providers,
      ...result.pagination_detals
      // ... will include the following
      //   page_num,
      //   limit,
      //   totalPages: Math.ceil(total / limit),
      //   totalRecords: total_records,
      //   hasNextPage: has_next_page,
      //   hasPrevPage: has_prev_page,
      //   nextRoute: has_next_page ? `/providers?page=${page_num + 1}&limit=${limit}` : null,
      //   prevRoute: has_prev_page ? `/providers?page=${page_num - 1}&limit=${limit}` : null
    });


  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Provider lookup failed', details: err.message });
  }
}



async function getProvider(req, res) {
  const providerId = req.params.id;
  try {
    const result = await providerService.getProvider(providerId)

    if (!result) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res.json(result);

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Provider lookup failed', details: err.message });
  }

}


module.exports = {
  listProviders,
  getProvider
};