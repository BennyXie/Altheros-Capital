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

    const result = await providerService.listProviders(req.query);

    res.json({
      providers: result.providers,
      ...result.pagination_details
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

async function getProviderHeadshot(req, res) {
  const providerId = req.params.id;
  
  try {
    const presignedUrl = await providerService.getProviderHeadshotUrl(providerId);
    
    res.json({ 
      presignedUrl,
      expiresIn: 600, // 10 minutes in seconds
      message: "Pre-signed URL generated successfully"
    });

  } catch (err) {
    console.error('Headshot URL generation failed:', err);
    
    if (err.message === "Provider not found") {
      return res.status(404).json({ error: "Provider not found" });
    }
    
    if (err.message === "Provider does not have a headshot uploaded") {
      return res.status(404).json({ error: "Provider does not have a headshot uploaded" });
    }
    
    res.status(500).json({ error: 'Failed to generate headshot URL', details: err.message });
  }
}

module.exports = {
  listProviders,
  getProvider,
  getProviderHeadshot,
};