const verifyJwt = require('../utils/verifyJwt');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing from Authorization header' });
  }

  try {
    const decoded = await verifyJwt(token);

    // Attach decoded token to the request for use in controllers
    req.user = decoded;

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ error: 'Token verification failed', details: err.message });
  }
};
