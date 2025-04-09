const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new room
router.post('/', async (req, res) => {
  try {
    // Format roomNo and hotelID before saving
    const roomData = {
      ...req.body,
      roomNo: req.body.roomNo.startsWith('RM') ? req.body.roomNo : `RM${req.body.roomNo.padStart(3, '0')}`,
      hotelID: req.body.hotelID.startsWith('HT') ? req.body.hotelID : `HT${req.body.hotelID.padStart(3, '0')}`
    };

    const room = new Room(roomData);
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a room
router.put('/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a room
router.delete('/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;