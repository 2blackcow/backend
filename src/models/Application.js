const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  coverLetter: {
    type: String,
    required: true,
    minlength: [30, '자기소개서는 최소 30자 이상이어야 합니다.']
  },
  expectedSalary: {
    amount: Number,
    currency: { type: String, default: 'KRW' }
  },
  availableStartDate: Date,
  history: [{
    status: String,
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  recruiterNotes: [{
    content: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  interviewPreference: {
    type: { type: String, enum: ['ONLINE', 'OFFLINE', 'BOTH'] },
    availableDates: [Date],
    notes: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 중복 지원 방지를 위한 복합 인덱스
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// 조회를 위한 인덱스
applicationSchema.index({ status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ userId: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;