const resumeSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    education: [{
      school: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date
    }],
    experience: [{
      company: String,
      position: String,
      description: String,
      startDate: Date,
      endDate: Date
    }],
    skills: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });