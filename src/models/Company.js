const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  industry: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    required: true,
    minlength: [50, '회사 설명은 최소 50자 이상이어야 합니다.']
  },
  location: {
    address: String,
    city: { type: String, required: true },
    country: { type: String, default: 'KR' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  size: {
    type: String,
    enum: ['1-50', '51-200', '201-1000', '1001-5000', '5000+']
  },
  foundedYear: Number,
  employees: {
    total: Number,
    developers: Number
  },
  benefits: [String],
  culture: [String],
  techStack: [String],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    github: String
  },
  logo: String,
  images: [String],
  verified: { 
    type: Boolean, 
    default: false 
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 인덱스 설정
companySchema.index({ companyName: 1 }, { unique: true });
companySchema.index({ industry: 1 });
companySchema.index({ 'location.city': 1 });
companySchema.index({ techStack: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;