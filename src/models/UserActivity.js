const userActivitySchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    activityType: {
      type: String,
      enum: ['view', 'apply', 'bookmark', 'search', 'login'],
      required: true
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel'
    },
    targetModel: {
      type: String,
      enum: ['Job', 'Company', 'Resume']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  });