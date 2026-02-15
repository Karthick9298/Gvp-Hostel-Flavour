import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Menu item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: ['main', 'side', 'beverage', 'dessert'],
    default: 'main'
  }
});

const mealMenuSchema = new mongoose.Schema({
  items: [menuItemSchema],
  special: {
    type: String,
    trim: true,
    maxlength: [200, 'Special note cannot exceed 200 characters'],
    default: ''
  }
});

// Simple weekly menu template (no dates needed)
const weeklyMenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu name is required'],
    trim: true,
    maxlength: [100, 'Menu name cannot exceed 100 characters'],
    default: 'Standard Weekly Menu'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  days: {
    monday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    },
    tuesday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    },
    wednesday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    },
    thursday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    },
    friday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    },
    saturday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    },
    sunday: {
      morning: mealMenuSchema,
      afternoon: mealMenuSchema,
      evening: mealMenuSchema,
      night: mealMenuSchema
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
weeklyMenuSchema.index({ isActive: 1 });

// Static method to get the active weekly menu
weeklyMenuSchema.statics.getActiveMenu = async function() {
  return await this.findOne({ isActive: true });
};

// Static method to get today's menu
weeklyMenuSchema.statics.getTodaysMenu = async function() {
  const menu = await this.getActiveMenu();
  if (!menu) return null;
  
  // Get current day name in IST
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[istTime.getDay()];
  
  // console.log(`Debug: Today is ${dayName}, IST time: ${istTime.toLocaleString()}`);
  
  return {
    dayName,
    meals: menu.days[dayName],
    menuName: menu.name
  };
};

// Static method to get menu for a specific day
weeklyMenuSchema.statics.getMenuForDay = async function(dayName) {
  const menu = await this.getActiveMenu();
  if (!menu) return null;
  
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (!validDays.includes(dayName.toLowerCase())) {
    throw new Error('Invalid day name');
  }
  
  return {
    dayName: dayName.toLowerCase(),
    meals: menu.days[dayName.toLowerCase()],
    menuName: menu.name
  };
};

// Instance method to get specific day menu
weeklyMenuSchema.methods.getDayMenu = function(dayName) {
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (!validDays.includes(dayName.toLowerCase())) {
    throw new Error('Invalid day name');
  }
  
  return {
    dayName: dayName.toLowerCase(),
    meals: this.days[dayName.toLowerCase()],
    menuName: this.name
  };
};

export default mongoose.model('WeeklyMenu', weeklyMenuSchema);
