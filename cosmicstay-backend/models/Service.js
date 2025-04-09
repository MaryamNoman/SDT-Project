const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceID: { 
    type: String, 
    required: true, 
    unique: true,
    default: function() {
      return `SE${Math.floor(1000 + Math.random() * 9000)}`;
    },
    match: [/^SE\d{4}$/, 'Service ID must be in format SEXXXX']
  },
  name: { 
    type: String, 
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [2, 'Service name must be at least 2 characters long'],
    maxlength: [15, 'Service name cannot exceed 15 characters'],
    unique: true,
    validate: {
      validator: async function(v) {
        const existingService = await this.constructor.findOne({ 
          name: { $regex: new RegExp(`^${v}$`, 'i') },
          _id: { $ne: this._id }
        });
        return !existingService;
      },
      message: props => `${props.value} is already taken`
    }
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least 1'],
    max: [999, 'Price cannot exceed 999'],
    set: v => Math.round(v * 100) / 100 // Ensure 2 decimal places
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes
serviceSchema.index({ serviceID: 1 });
serviceSchema.index({ name: 1 }, { collation: { locale: 'en', strength: 2 } }); // Case-insensitive index

// Pre-save hook for default services
serviceSchema.pre('save', async function(next) {
  const defaultServices = ['Room Service', 'Laundry', 'Spa'];
  
  if (defaultServices.includes(this.name)) {
    this.isDefault = true;
    
    // Check if default service already exists
    const existingDefault = await this.constructor.findOne({ 
      name: this.name,
      isDefault: true 
    });
    
    if (existingDefault && !this._id.equals(existingDefault._id)) {
      throw new Error(`${this.name} is a default service and already exists`);
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to initialize default services
serviceSchema.statics.initializeDefaults = async function() {
  const defaultServices = [
    { name: 'Room Service', price: 20, isDefault: true },
    { name: 'Laundry', price: 15, isDefault: true },
    { name: 'Spa', price: 50, isDefault: true }
  ];

  for (const service of defaultServices) {
    await this.findOneAndUpdate(
      { name: service.name },
      service,
      { upsert: true, new: true }
    );
  }
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;