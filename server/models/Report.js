const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Anonymous reporter identification
  reporterId: {
    type: String,
    required: true,
    index: true
  },
  
  // Report content
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  
  // Incident categorization
  category: {
    type: String,
    required: true,
    enum: [
      'harassment',
      'assault',
      'theft',
      'vandalism',
      'suspicious_activity',
      'emergency',
      'safety_hazard',
      'discrimination',
      'bullying',
      'other'
    ]
  },
  
  // AI-generated fields
  aiCategory: {
    type: String,
    enum: [
      'harassment',
      'assault',
      'theft',
      'vandalism',
      'suspicious_activity',
      'emergency',
      'safety_hazard',
      'discrimination',
      'bullying',
      'other'
    ]
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'distressed'],
    default: 'neutral'
  },
  
  // Location data (generalized for privacy)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    address: {
      type: String,
      maxlength: 200
    },
    building: {
      type: String,
      maxlength: 100
    },
    floor: {
      type: String,
      maxlength: 20
    }
  },
  
  // Timestamp
  incidentTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Media attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Report status and handling
  status: {
    type: String,
    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed'],
    default: 'pending'
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Admin notes (private)
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Public updates for reporter
  publicUpdates: [{
    message: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Privacy and data retention
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  dataRetentionDate: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years
  },
  
  // Metadata
  ipAddress: {
    type: String,
    required: false // Hashed for privacy
  },
  
  userAgent: {
    type: String,
    required: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ category: 1, createdAt: -1 });
reportSchema.index({ priority: 1, status: 1 });
reportSchema.index({ 'location.coordinates': '2dsphere' });
reportSchema.index({ dataRetentionDate: 1 });

// Pre-save middleware
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add admin note
reportSchema.methods.addAdminNote = function(note, adminId) {
  this.adminNotes.push({
    note,
    addedBy: adminId
  });
  return this.save();
};

// Method to add public update
reportSchema.methods.addPublicUpdate = function(message) {
  this.publicUpdates.push({
    message
  });
  return this.save();
};

// Method to update status
reportSchema.methods.updateStatus = function(newStatus, adminId = null) {
  this.status = newStatus;
  if (adminId) {
    this.assignedTo = adminId;
  }
  return this.save();
};

// Static method to get reports within radius
reportSchema.statics.getReportsNearLocation = function(longitude, latitude, radiusInMeters = 1000, limit = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    },
    status: { $ne: 'closed' }
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

// Static method to get heatmap data
reportSchema.statics.getHeatmapData = function(startDate, endDate, categories = []) {
  const query = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (categories.length > 0) {
    query.category = { $in: categories };
  }
  
  return this.find(query, {
    'location.coordinates': 1,
    category: 1,
    priority: 1,
    createdAt: 1
  });
};

module.exports = mongoose.model('Report', reportSchema);
