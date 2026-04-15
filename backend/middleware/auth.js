const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return sendError(res, "Unauthorized: missing token", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return sendError(res, "Unauthorized: invalid token", 401);
  }
};

module.exports = authMiddleware;
