// Invoice.js
const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['room', 'service'], required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  invoiceID: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `INV${Math.floor(1000 + Math.random() * 9000)}`
  },
  customerID: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^C\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid customer ID!`
    }
  },
  items: [invoiceItemSchema],
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Paid', 'Unpaid', 'Pending'], 
    default: 'Unpaid' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);