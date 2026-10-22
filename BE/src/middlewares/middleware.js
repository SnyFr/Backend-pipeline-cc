import jwt from "jsonwebtoken"
import sendResponse from "../utils/response.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendResponse(res, 401, false, 'Access token is missing or invalid');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'LEGIONFL@2054');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      status: false,
      message: "invalid or expired token!"
    })
  }
}

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendResponse(res, 403, false, 'Authenticate is needed. Role not found');
    }
    const {role} = req.user;

    if (!roles.includes(role)) {
      return sendResponse(res, 403, false, `Role ${role} do not have permission to this resource`)
    }
    
    next();
  };
};