// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Middleware
app.use(cors({
  origin: ["https://cosmicstay.netlify.app"],
  credentials: true
}));

app.use(express.json());

// Database connection - Using environment variable
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelManagement';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/users', require('./routes/users'));
app.use('/rooms', require('./routes/rooms'));
app.use('/customers', require('./routes/customers'));
app.use('/reservations', require('./routes/reservations'));
app.use('/services', require('./routes/services'));
app.use('/invoices', require('./routes/invoices'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/',(req,res)=>{
  res.send({
    activeStatus:true,
    error:false,
  })
})

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});