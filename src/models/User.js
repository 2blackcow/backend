const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String
});

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, '이메일은 필수 입력값입니다.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, '유효한 이메일 주소를 입력해주세요.']
  },
  password: { 
    type: String, 
    required: [true, '비밀번호는 필수 입력값입니다.'],
    minlength: [8, '비밀번호는 최소 8자 이상이어야 합니다.']
  },
  name: { 
    type: String, 
    required: [true, '이름은 필수 입력값입니다.'],
    trim: true,
    minlength: [2, '이름은 최소 2자 이상이어야 합니다.']
  },
  role: { 
    type: String, 
    enum: ['JOB_SEEKER', 'RECRUITER', 'ADMIN'],
    default: 'JOB_SEEKER'
  },
  profile: {
    phone: String,
    address: String,
    birthDate: Date,
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER']
    },
    skills: [String],
    experience: [experienceSchema],
    education: [{
      school: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date
    }]
  },
  refreshToken: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 이메일 중복 체크를 위한 인덱스
userSchema.index({ email: 1 }, { unique: true });

// 사용자 검색을 위한 인덱스
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;