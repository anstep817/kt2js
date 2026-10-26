require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  uploadDir: process.env.UPLOAD_DIR || 'uploads/products'
};
