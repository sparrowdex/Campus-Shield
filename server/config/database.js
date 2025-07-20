const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.log('💡 Please set MONGODB_URI in your environment variables');
    return;
  }

  console.log('🔗 Attempting to connect to MongoDB...');
  console.log('📊 URI format check:', mongoUri.substring(0, 20) + '...');

  try {
    // Try to connect to MongoDB with better error handling
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 second timeout for Atlas
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      tlsAllowInvalidCertificates: false
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Full error:', error);
    console.log('💡 To fix this:');
    console.log('   1. Check your MONGODB_URI environment variable');
    console.log('   2. Ensure MongoDB service is running');
    console.log('   3. Verify the connection string format');
    console.log('');
    
    // In production, we'll retry the connection with exponential backoff
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying database connection in 10 seconds...');
      setTimeout(() => {
        connectDB();
      }, 10000);
    } else {
      console.log('🔄 Starting without database for development...');
    }
  }
};

module.exports = connectDB;
