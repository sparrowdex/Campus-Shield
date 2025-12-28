const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Minimal user data for privacy
  anonymousId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Optional authenticated user data
  email: {
    type: String,
    sparse: true, // Allows multiple null values
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    minlength: 6
  },
  
  refreshToken: {
    type: String,
  },
  
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // Privacy settings
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  // Campus affiliation (optional)
  campusId: {
    type: String,
    index: true
  },
  
  // User preferences
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    locationSharing: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Privacy and security
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  dataRetentionDate: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for data cleanup
userSchema.index({ dataRetentionDate: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Static method to create anonymous user
userSchema.statics.createAnonymousUser = function(anonymousId, campusId = null) {
  return this.create({
    anonymousId,
    campusId,
    isAnonymous: true
  });
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
