// errorHandler.js - turns every error into a clean JSON response.

function notFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// Express recognises an error handler by its four parameters.
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request is too large.' });
  }
  if (err && err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'Upload failed.';
    return res.status(400).json({ error: message });
  }
  if (err && err.isUserError) {
    return res.status(400).json({ error: err.message });
  }
  // Log the real problem on the server, but never show internals to visitors.
  console.error('Server error:', err);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
