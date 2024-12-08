const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  isCurrently: { type: Boolean, default: false },
  grade: String,
  activities: [String],
  description: String
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  isCurrently: { type: Boolean, default: false },
  responsibilities: [String],
  achievements: [String],
  skills: [String],
  location: String,
  description: String
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  role: String,
  skills: [String],
  links: [{
    title: String,
    url: String
  }]
});

const resumeSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    profile: {
      summary: {
        type: String,
        required: true,
        
      },
      contact: {
        email: { type: String, required: true },
        phone: String,
        address: String,
        website: String,
        linkedin: String,
        github: String
      }
    },
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    skills: [{
      category: String,
      items: [String]
    }],
    languages: [{
      name: String,
      proficiency: { 
        type: String, 
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE'] 
      }
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String
    }],
    awards: [{
      title: String,
      issuer: String,
      date: Date,
      description: String
    }],
    volunteer: [{
      organization: String,
      role: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    references: [{
      name: String,
      position: String,
      company: String,
      email: String,
      phone: String,
      relationship: String
    }],
    customSections: [{
      title: String,
      content: String
    }],
    privacy: {
      isPublic: { type: Boolean, default: false },
      hideContact: { type: Boolean, default: true },
      hideReferences: { type: Boolean, default: true }
    },
    metadata: {
      lastModified: { type: Date, default: Date.now },
      version: { type: Number, default: 1 },
      applicationCount: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }, {
    timestamps: true
  });
  
  // 인덱스 설정
  resumeSchema.index({ userId: 1 });
  resumeSchema.index({ isActive: 1 });
  resumeSchema.index({ 'skills.items': 1 });
  resumeSchema.index({ 'privacy.isPublic': 1 });
  resumeSchema.index({ 'metadata.lastModified': -1 });
  
  const Resume = mongoose.model('Resume', resumeSchema);
  
  module.exports = Resume;
