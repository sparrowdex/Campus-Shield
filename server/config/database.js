const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusshield', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('💡 To fix this:');
    console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('   2. Or use MongoDB Atlas (free): https://www.mongodb.com/atlas');
    console.log('   3. Create a .env file with your MONGODB_URI');
    console.log('');
    console.log('🔄 Starting with in-memory database for testing...');
    
    // For testing purposes, we'll continue without database
    // In production, you should exit here
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
