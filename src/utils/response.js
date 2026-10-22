const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};

export default sendResponse;