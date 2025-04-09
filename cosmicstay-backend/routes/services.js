const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Initialize default services on server start
Service.initializeDefaults();

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ isDefault: -1, name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new service
router.post('/', async (req, res) => {
  try {
    const service = new Service({
      name: req.body.name,
      price: req.body.price
    });
    
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.isDefault) {
      return res.status(400).json({ message: 'Default services cannot be modified' });
    }

    service.name = req.body.name || service.name;
    service.price = req.body.price || service.price;
    
    const updatedService = await service.save();
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.isDefault) {
      return res.status(400).json({ message: 'Default services cannot be deleted' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;