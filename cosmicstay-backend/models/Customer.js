// const mongoose = require('mongoose');

// const customerSchema = new mongoose.Schema({
//   customerID: { 
//     type: String, 
//     required: true, 
//     unique: true,
//     default: () => `C${Math.floor(1000 + Math.random() * 9000)}` // Auto-generate CXXXX IDs
//   },
//   name: { type: String, required: true },
//   contactInfo: { 
//     type: String, 
//     required: true,
//     validate: {
//       validator: function(v) {
//         return /^\d{11}$/.test(v);
//       },
//       message: props => `${props.value} is not a valid 11-digit phone number!`
//     }
//   },
//   nationality: { type: String, required: true },
//   gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }
// }, { timestamps: true }); // Add timestamps for created/updated

// module.exports = mongoose.model('Customer', customerSchema);
























// Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerID: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `C${Math.floor(1000 + Math.random() * 9000)}` // Auto-generate CXXXX IDs
  },
  name: { type: String, required: true },
  contactInfo: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\+\d{1,4}-\d{4,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid international phone number! Format: +[country code]-[local number]`
    }
  },
  nationality: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);