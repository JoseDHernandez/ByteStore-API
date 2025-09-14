module.exports = {
  port: process.env.PORT || 8000,
  jwtSecret: process.env.JWT_SECRET || '@y*&0a%K%7P0t@uQ^38HN$y4Z^PK#0zE7dem700Bbf&pC6HF$aU^ARkE@u$nn',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bytestore_cart'
};