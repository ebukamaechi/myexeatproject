const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
const authenticateUser = (req, res, next) => {
  console.log("Cookies:", req.cookies); // Debugging step

  if (!req.cookies || !req.cookies.access_token) {
    return res
      .status(401)
      .json({
        message: "Unauthorized, please log in",
        error: "Unauthorized, please log in",
      });
  }
  // const token = req.cookies?.access_token; // Optional chaining to prevent undefined error
  const token =
    req.cookies?.access_token || req.headers.authorization?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Decoded Token: ", decoded); //check if token is valid
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware to check if the user has the required role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
