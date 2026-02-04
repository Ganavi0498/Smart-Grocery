function notFound(req, res, next) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const code = err.code || "SERVER_ERROR";

  res.status(status).json({
    error: {
      code,
      message: err.message || "Something went wrong",
      details: err.details || null,
    },
  });
}

module.exports = { notFound, errorHandler };
