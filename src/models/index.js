const mongoose = require('mongoose');
const dbConfig = require('../config/database');

// DB 연결
mongoose.connect(dbConfig.url, dbConfig.options);

// 모델 import
const User = require('./User');
const Company = require('./Company');
const Job = require('./Job');
const Application = require('./Application');
const Bookmark = require('./Bookmark');
const Resume = require('./Resume');
const SearchHistory = require('./SearchHistory');
const UserActivity = require('./UserActivity');

// DB 연결 이벤트 핸들러
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// 모델 export
module.exports = {
  User,
  Company,
  Job,
  Application,
  Bookmark,
  Resume,
  SearchHistory,
  UserActivity
};