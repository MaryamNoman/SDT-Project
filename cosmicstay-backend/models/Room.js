// const mongoose = require('mongoose');

// const roomSchema = new mongoose.Schema({
//   roomNo: { 
//     type: String, 
//     required: true, 
//     unique: true
//   },
//   hotelID: { 
//     type: String, 
//     required: true
//   },
//   roomCategory: { 
//     type: String, 
//     enum: ['deluxe', 'studio', 'standard'], 
//     required: true 
//   },
//   rent: { type: Number, required: true },
//   status: { 
//     type: String, 
//     enum: ['Available', 'Occupied', 'Maintenance'], 
//     default: 'Available' 
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Room', roomSchema);























// Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo: { 
    type: String, 
    required: true, 
    unique: true
  },
  hotelID: { 
    type: String, 
    required: true
  },
  roomCategory: { 
    type: String, 
    enum: ['deluxe', 'studio', 'standard'], 
    required: true 
  },
  rent: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Maintenance'], 
    default: 'Available' 
  },
  lastOccupied: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update lastOccupied when status changes to 'Occupied'
roomSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Occupied') {
    this.lastOccupied = new Date();
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);