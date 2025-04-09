const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userID: { 
    type: String, 
    required: true,
    unique: true,
    default: () => `US${Math.floor(1000 + Math.random() * 9000)}`
  },
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: { 
    type: String, 
    enum: ['Accountant', 'Receptionist'], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);