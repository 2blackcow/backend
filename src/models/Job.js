const jobSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    requirements: [String],
    location: String,
    salary: {
      min: Number,
      max: Number,
      type: String
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship']
    },
    experienceLevel: String,
    skills: [String],
    postedDate: {
      type: Date,
      default: Date.now
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active'
    },
    viewCount: {
      type: Number,
      default: 0
    }
  });