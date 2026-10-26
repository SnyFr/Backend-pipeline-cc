import jwt from "jsonwebtoken";
import sendResponse from "../utils/response.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, false, "Access token is missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, 401, false, "Token has expired, please login again");
    }
    
    return sendResponse(res, 401, false, "Invalid or corrupted access token");
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendResponse(res, 401, false, "Authentication required");
    }

    const { role } = req.user;

    if (!roles.includes(role)) {
      return sendResponse(
        res,
        403,
        false,
        `Role '${role}' does not have permission to access this resource`
      );
    }

    next();
  };
};