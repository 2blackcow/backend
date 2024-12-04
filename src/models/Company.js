const companySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: String,
    industry: String,
    location: String,
    employeeCount: Number,
    website: String,
    logo: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  });