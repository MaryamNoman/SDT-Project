// Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationID: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `RE${Math.floor(1000 + Math.random() * 9000)}`
  },
  customerID: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^C\d{4}$/.test(v); // Validate it matches customerID format
      },
      message: props => `${props.value} is not a valid customer ID!`
    }
  },
  roomNo: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);