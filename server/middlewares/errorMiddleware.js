

function errorMiddleware(err, req, res, next) {
  console.error('🔥 ERROR:', err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  if (err.name === 'ValidationError') {
    status = 400;
    errors = {};
    for (let field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    message = 'Validation failed';
  }


  if (err.code === 11000) {
    status = 400;
    const fields = Object.keys(err.keyValue);
    message = `${fields.join(', ')} already exists`;
    errors = err.keyValue;
  }


  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }


  return res.status(status).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorMiddleware;
