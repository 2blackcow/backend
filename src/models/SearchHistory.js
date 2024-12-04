const searchHistorySchema = new mongoose.Schema({
    user: {
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
      salary: {
        min: Number,
        max: Number
      },
      employmentType: String,
      skills: [String]
    },
    searchedAt: {
      type: Date,
      default: Date.now
    }
  });
  