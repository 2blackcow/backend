const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  note: String,
  status: {
    type: String,
    enum: ['INTERESTED', 'APPLIED', 'NOT_INTERESTED'],
    default: 'INTERESTED'
  },
  reminderDate: Date,
  isNotificationEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 중복 북마크 방지를 위한 복합 인덱스
bookmarkSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// 조회를 위한 인덱스
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ reminderDate: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;