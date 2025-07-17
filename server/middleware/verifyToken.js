const verifyJwt = require('../utils/verifyJwt');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Token missing or malformed in Authorization header');
    return res.status(401).json({ error: 'Token missing or malformed in Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token ? '[present]' : '[missing]');

  try {
    const decoded = await verifyJwt(token);
    console.log('Decoded token in verifyToken middleware:', decoded);
    console.log('username from decoded token:', decoded.username);

    // Attach decoded token to the request for use in controllers
    req.user = { ...decoded, username: decoded.username || decoded['cognito:username'] };

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ error: 'Token verification failed', details: err.message });
  }
};
