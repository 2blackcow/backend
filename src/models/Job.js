const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [5, '제목은 최소 5자 이상이어야 합니다.']
  },
  description: { 
    type: String, 
    required: true,
    minlength: [20, '설명은 최소 20자 이상이어야 합니다.']
  },
  requirements: [String],
  salary: {
    min: Number,
    max: Number,
    currency: { 
      type: String, 
      default: 'KRW',
      enum: ['KRW', 'USD', 'EUR']
    },
    isNegotiable: { type: Boolean, default: false }
  },
  jobType: { 
    type: String, 
    required: true,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']
  },
  location: {
    address: String,
    city: { type: String, required: true },
    country: { type: String, default: 'KR' }
  },
  skills: [String],
  experienceLevel: { 
    type: String, 
    required: true,
    enum: ['ENTRY', 'INTERMEDIATE', 'SENIOR', 'EXECUTIVE']
  },
  benefits: [String],
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: '마감일은 현재 날짜보다 이후여야 합니다.'
    }
  },
  workingHours: {
    start: String,
    end: String,
    flexTime: Boolean
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'],
    default: 'ACTIVE'
  },
  applicantCount: { 
    type: Number, 
    default: 0 
  },
  viewCount: { 
    type: Number, 
    default: 0 
  },
  originalPostingUrl: { 
    type: String,
    unique: true
  },
  isRemote: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 검색을 위한 인덱스
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ skills: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;