const { Location } = require('../models');

// Create new Industry
const createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Location name is required' });
    const location = await Location.create({ name });
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all industries 

const getLocation = async (req, res) => {
  try {
    const location = await Location.findAll({ order: [['name', 'ASC']] });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete Industry
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Location.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: 'Location not found' });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




module.exports = { createLocation, deleteLocation, getLocation  }