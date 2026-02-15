import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: () => {
      // Set to current date in IST, but only date part (no time)
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const currentDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
      currentDate.setHours(0, 0, 0, 0); // Ensure time is 00:00:00.000
      return currentDate;
    }
  },
  meals: {
    morning: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    afternoon: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    evening: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    },
    night: {
      rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        default: ''
      },
      submittedAt: {
        type: Date,
        default: null
      }
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure one feedback per user per day
feedbackSchema.index({ user: 1, date: 1 }, { unique: true });

// Index for faster date-based queries
feedbackSchema.index({ date: -1 });

// Method to check if a meal can be submitted based on time
feedbackSchema.methods.canSubmitMeal = function(mealType) {
  // Get current time in IST
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const currentHour = istTime.getHours();
  
  // console.log(`Debug: Current IST time: ${istTime.toLocaleString()}, Hour: ${currentHour}, Meal: ${mealType}`);

  // Check if meal is already submitted
  if (this.meals[mealType].rating !== null) {
    return { canSubmit: false, reason: 'Meal already submitted' };
  }

  // Time-based submission rules - each meal can be submitted from specific time till midnight
  switch (mealType) {
    case 'morning':
      // Morning meal can be submitted from 9 AM till midnight (11:59 PM)
      if (currentHour >= 9) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: `Morning meal feedback can only be submitted from 9 AM onwards. Current time: ${currentHour}:00` };
    
    case 'afternoon':
      // Afternoon meal can be submitted from 1 PM till midnight (11:59 PM)
      if (currentHour >= 13) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: `Afternoon meal feedback can only be submitted from 1 PM onwards. Current time: ${currentHour}:00` };
    
    case 'evening':
      // Evening meal can be submitted from 5 PM till midnight (11:59 PM)
      if (currentHour >= 13) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: `Evening meal feedback can only be submitted from 5 PM onwards. Current time: ${currentHour}:00` };
    
    case 'night':
      // Night meal can be submitted from 8 PM till midnight (11:59 PM)
      if (currentHour >= 13) {
        return { canSubmit: true };
      }
      return { canSubmit: false, reason: `Night meal feedback can only be submitted from 8 PM onwards. Current time: ${currentHour}:00` };
    
    default:
      return { canSubmit: false, reason: 'Invalid meal type' };
  }
};

// Method to get submission statistics
feedbackSchema.methods.getSubmissionStats = function() {
  const submittedMeals = ['morning', 'afternoon', 'evening', 'night'].filter(
    meal => this.meals[meal].rating !== null
  );
  
  return {
    totalMeals: 4,
    submittedMeals: submittedMeals.length,
    pendingMeals: 4 - submittedMeals.length,
    submittedMealTypes: submittedMeals
  };
};

export default mongoose.model('Feedback', feedbackSchema);
