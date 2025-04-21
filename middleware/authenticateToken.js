const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'akash@172002';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if authorization header exists
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Authorization header missing. Please login to access this resource.'
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token missing. Please include your bearer token.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Different error messages for different JWT errors
    let errorMessage = 'Invalid token';
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Session expired. Please login again.';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token format';
    }

    res.status(403).json({ 
      success: false,
      message: errorMessage,
      shouldLogout: true // Flag for frontend to handle logout
    });
  }
};

// Enhanced checkAdmin middleware
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before checking admin status'
    });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Admin privileges required to access this resource',
      requiredRole: 'admin',
      currentRole: req.user.role
    });
  }
};

module.exports = { authenticateToken, checkAdmin };
