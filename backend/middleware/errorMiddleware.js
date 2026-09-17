/**
 * Catches requests to routes that don't exist.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error handler. Any `throw new Error(...)` inside an
 * asyncHandler-wrapped controller ends up here.
 */
const errorHandler = (err, req, res, next) => {
  // If a status code was already set (e.g. 401/403), keep it; else default to 500.
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Handle common Mongoose errors with friendlier messages.
  let message = err.message;

  if (err.name === 'CastError') {
    message = `Invalid value for field '${err.path}'`;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists`;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
