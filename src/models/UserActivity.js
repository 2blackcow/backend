const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      'VIEW_JOB',
      'APPLY_JOB',
      'SAVE_JOB',
      'UPDATE_PROFILE',
      'UPDATE_RESUME',
      'SEARCH',
      'LOGIN',
      'LOGOUT',
      'VIEW_COMPANY',
      'COMPLETE_PROFILE',
      'CHANGE_PASSWORD',
      'DELETE_ACCOUNT'
    ]
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Job', 'Resume', 'Company', 'User']
  },
  metadata: {
    action: String,
    status: String,
    details: mongoose.Schema.Types.Mixed,
    duration: Number
  },
  location: {
    ip: String,
    city: String,
    country: String
  },
  device: {
    userAgent: String,
    browser: String,
    os: String,
    device: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'ERROR'],
    default: 'SUCCESS'
  },
  error: {
    code: String,
    message: String,
    stack: String
  },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 인덱스 설정
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ type: 1 });
userActivitySchema.index({ targetId: 1, type: 1 });
userActivitySchema.index({ status: 1 });
userActivitySchema.index({ 'location.city': 1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;