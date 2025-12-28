require('dotenv').config();
const { server } = require('./app');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 CampusShield server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}