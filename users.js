const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/professionals/:category - Get professionals by category
router.get('/professionals/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['plumbing', 'electrical', 'carpentry', 'painting', 'cleaning'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Find professionals with the specified skill/category
    const professionals = await User.find({
      role: 'professional',
      skills: category
    }).select('-passwordHash');

    if (professionals.length === 0) {
      return res.status(404).json({ 
        error: 'No professionals found for this category',
        professionals: []
      });
    }

    res.json({ professionals });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - Get user by ID (for getting homeowner/professional details)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/professionals - Get all professionals
router.get('/professionals', async (req, res) => {
  try {
    const professionals = await User.find({
      role: 'professional'
    }).select('-passwordHash');

    res.json({ professionals });
  } catch (error) {
    console.error('Error fetching all professionals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
