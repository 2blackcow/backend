const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  query: { 
    type: String, 
    required: true 
  },
  filters: {
    location: String,
    jobType: String,
    experienceLevel: String,
    skills: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'KRW' }
    },
    remote: Boolean,
    companies: [String],
    industries: [String]
  },
  results: {
    total: Number,
    pages: Number,
    jobIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Job' 
    }]
  },
  interaction: {
    clickedJobs: [{
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      timestamp: { type: Date, default: Date.now }
    }],
    appliedJobs: [{
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  metadata: {
    device: String,
    browser: String,
    platform: String,
    ip: String
  },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 인덱스 설정
searchHistorySchema.index({ userId: 1, timestamp: -1 });
searchHistorySchema.index({ query: 'text' });
searchHistorySchema.index({ 'filters.location': 1 });
searchHistorySchema.index({ 'filters.skills': 1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;