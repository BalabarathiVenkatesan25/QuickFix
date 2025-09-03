const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/requests - Create a new service request
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      urgency,
      budget,
      scheduledDate
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate category
    const validCategories = ['plumbing', 'electrical', 'carpentry', 'painting', 'cleaning'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate location fields
    if (!location.address || !location.city || !location.state || !location.zipCode) {
      return res.status(400).json({ error: 'Missing location information' });
    }

    // Create the request
    const newRequest = new Request({
      title,
      description,
      category,
      location,
      urgency: urgency || 'medium',
      budget,
      scheduledDate,
      homeowner: req.user._id
    });

    await newRequest.save();

    // Populate homeowner details
    await newRequest.populate('homeowner', '-passwordHash');

    res.status(201).json({ request: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/requests/:id/send - Send request to a specific professional
router.post('/:id/send', auth, async (req, res) => {
  try {
    const { professionalId } = req.body;
    const requestId = req.params.id;

    if (!professionalId) {
      return res.status(400).json({ error: 'Professional ID is required' });
    }

    // Find the request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify the request belongs to the current user
    if (request.homeowner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this request' });
    }

    // Verify the professional exists and has the required skill
    const professional = await User.findById(professionalId);
    if (!professional || professional.role !== 'professional') {
      return res.status(404).json({ error: 'Professional not found' });
    }

    if (!professional.skills.includes(request.category)) {
      return res.status(400).json({ error: 'Professional does not have the required skill' });
    }

    // Update the request with the professional
    request.professional = professionalId;
    request.status = 'pending';
    await request.save();

    // Populate the updated request
    await request.populate(['homeowner', 'professional'], '-passwordHash');

    res.json({ request });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/my-requests - Get current user's requests (homeowner)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ homeowner: req.user._id })
      .populate('professional', '-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/incoming - Get incoming requests for professionals
router.get('/incoming', auth, async (req, res) => {
  try {
    if (req.user.role !== 'professional') {
      return res.status(403).json({ error: 'Only professionals can access incoming requests' });
    }

    const requests = await Request.find({ 
      professional: req.user._id,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    })
      .populate('homeowner', '-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/requests/:id/status - Update request status (for professionals)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify the professional is assigned to this request
    if (request.professional.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this request' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedDate = new Date();
    }

    await request.save();
    await request.populate(['homeowner', 'professional'], '-passwordHash');

    res.json({ request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/:id - Get a specific request
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate(['homeowner', 'professional'], '-passwordHash');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user is authorized to view this request
    const isHomeowner = request.homeowner._id.toString() === req.user._id.toString();
    const isProfessional = request.professional && request.professional._id.toString() === req.user._id.toString();

    if (!isHomeowner && !isProfessional) {
      return res.status(403).json({ error: 'Not authorized to view this request' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
