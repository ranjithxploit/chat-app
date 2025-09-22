import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'group';
    }
  },
  description: {
    type: String
  },
  avatar: {
    type: String
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  unreadCounts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  // Group chat specific fields
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'group';
    }
  },
  settings: {
    allowMembersToAddOthers: {
      type: Boolean,
      default: false
    },
    allowMembersToEditInfo: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });

// Virtual for getting chat name in private chats
chatSchema.virtual('displayName').get(function() {
  if (this.type === 'group') {
    return this.name;
  }
  // For private chats, this would be set based on the other participant
  return null;
});

export default mongoose.model('Chat', chatSchema);