import mongoose from 'mongoose';

const fileShareSchema = new mongoose.Schema({
  shareCode: {
    type: String,
    required: true,
    unique: true,
    length: 6,
    uppercase: true
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    max: 104857600 // 100MB in bytes
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true // Cloudinary public ID for deletion
  },
  mimeType: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v === 'application/zip' || v === 'application/x-zip-compressed';
      },
      message: 'Only ZIP files are allowed'
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    }
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: 1 // Only one download allowed
  },
  downloadedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for automatic expiration
fileShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for share code lookup
fileShareSchema.index({ shareCode: 1 });

// Generate unique share code
fileShareSchema.statics.generateShareCode = async function() {
  let shareCode;
  let isUnique = false;
  
  while (!isUnique) {
    shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingShare = await this.findOne({ shareCode, isActive: true });
    if (!existingShare) {
      isUnique = true;
    }
  }
  
  return shareCode;
};

// Check if file can be downloaded
fileShareSchema.methods.canDownload = function() {
  const now = new Date();
  return this.isActive && 
         this.expiresAt > now && 
         this.downloadCount < this.maxDownloads;
};

// Mark as downloaded
fileShareSchema.methods.markDownloaded = function(userId, ipAddress) {
  this.downloadCount += 1;
  this.downloadedBy.push({
    userId,
    downloadedAt: new Date(),
    ipAddress
  });
  
  // Deactivate if max downloads reached
  if (this.downloadCount >= this.maxDownloads) {
    this.isActive = false;
  }
  
  return this.save();
};

export default mongoose.model('FileShare', fileShareSchema);