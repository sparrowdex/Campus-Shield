#!/usr/bin/env node

// Simple startup script for Railway deployment
console.log('🚀 Starting CampusShield Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Port:', process.env.PORT || 5000);

// Check if MongoDB URI is set
console.log('🔍 Environment variables check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set. Database features will not work.');
  console.log('💡 Please check your Railway environment variables');
  console.log('💡 Make sure you added MONGODB_URI in the Variables tab');
} else {
  console.log('✅ MONGODB_URI is configured');
  console.log('🔗 URI starts with:', process.env.MONGODB_URI.substring(0, 30) + '...');
}

// Start the server
require('./index.js'); 