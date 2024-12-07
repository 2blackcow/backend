require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어 설정
app.use(express.json());

// 라우트 설정
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/companies', require('./routes/companies'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));