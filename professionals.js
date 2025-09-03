const express = require('express');
const User = require('../models/User');
const { ALLOWED_SKILLS } = require('../constants/skills');

const router = express.Router();

// List professionals (optionally filter by skill)
router.get('/', async (req, res) => {
  try {
    const { skill } = req.query;
    const query = { role: 'professional' };
    if (skill && ALLOWED_SKILLS.includes(skill)) {
      query.skills = skill;
    }
    const pros = await User.find(query).select(
      '_id name email role skills createdAt updatedAt'
    );
    return res.json(
      pros.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        skills: u.skills,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Get single professional by id
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u || u.role !== 'professional') {
      return res.status(404).json({ message: 'Professional not found' });
    }
    return res.json({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      skills: u.skills,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// Update current professional
router.put('/me', async (req, res) => {
  try {
    const userId = req.user?.id; // assumes auth middleware sets req.user
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, role, skills } = req.body;

    if (typeof name === 'string' && name.trim().length > 0) {
      user.name = name.trim();
    }

    if (['client', 'professional', 'admin'].includes(role)) {
      user.role = role;
    }

    if (user.role === 'professional') {
      if (!Array.isArray(skills) || skills.length === 0) {
        return res
          .status(400)
          .json({ message: 'Professionals must select at least one skill.' });
      }
      const invalid = skills.filter((s) => !ALLOWED_SKILLS.includes(s));
      if (invalid.length > 0) {
        return res.status(400).json({
          message: `Invalid skills: ${invalid.join(', ')}.`,
        });
      }
      user.skills = [...new Set(skills)];
    } else {
      user.skills = [];
    }

    await user.save();

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;


