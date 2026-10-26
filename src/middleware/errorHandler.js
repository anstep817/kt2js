const multer = require('multer');

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 2MB)' : 'Only JPEG and PNG allowed' });
  }
  console.log(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
