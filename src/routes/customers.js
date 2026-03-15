import express from 'express';
import Customer from '../models/Customer.js';
import { protectAdmin } from '../middleware/authAdmin.js';
import { Parser } from 'json2csv';
const router = express.Router();

// Create customer (public - no auth)
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// Get all customers (admin only)
router.get('/',protectAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/export/csv', protectAdmin, async (req, res) => {
  try {
    const { filter } = req.query;

    let query = {};
    if (filter === 'Watched') {
      query.isWebinarCompleted = true;
    } else if (filter === 'Not watched') {
      query.isWebinarCompleted = false;
    }

    const customers = await Customer.find(query)
      .select(
        'fullName email mobileNo dateOfBirth jobTitle currentProfession city district state pincode isWebinarCompleted createdAt'
      )
      .lean()
      .sort({ createdAt: -1 });

    if (!customers || customers.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No customers found to export',
      });
    }

    // Explicit field order + transformations
    const fields = [
      'Full Name',
      'Email',
      'Mobile No',
      'Date of Birth',
      'Job Type',
      'Current Profession',
      'City',
      'District',
      'State',
      'Pincode',
      'Webinar Watched',
      'Registered On',
    ];

    const json2csvParser = new Parser({
      fields,
      header: true,
      // Optional: customize delimiter, quote, etc.
      // delimiter: ',',
      // quote: '"',
    });

    const transformedData = customers.map((customer) => ({
  'Full Name': customer.fullName || '',
  Email: customer.email || '',
  'Mobile No': customer.mobileNo ? `'${customer.mobileNo}` : '',           // already have this
  'Date of Birth': customer.dateOfBirth 
    ? `'${new Date(customer.dateOfBirth).toISOString().split('T')[0]}`    // ← add ' here
    : '',
  'Job Type': customer.jobTitle || '',
  'Current Profession': customer.currentProfession || '',
  City: customer.city || '',
  District: customer.district || '',
  State: customer.state || '',
  Pincode: customer.pincode || '',
  'Webinar Watched': customer.isWebinarCompleted ? 'Yes' : 'No',
  'Registered On': customer.createdAt 
    ? `'${new Date(customer.createdAt).toISOString().split('T')[0]}`      // ← add ' here
    : '',
}));

    const csv = json2csvParser.parse(transformedData);

    // Set proper headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customers-${filter || 'all'}-${new Date()
        .toISOString()
        .split('T')[0]}.csv"`
    );

    return res.status(200).send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate CSV file',
      error: err.message,
    });
  }
});

// ── Dashboard stats ──────────────────────────────────────────────────────────
router.get('/dashboard/stats', protectAdmin, async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const watched = await Customer.countDocuments({ isWebinarCompleted: true });
    const notWatched = total - watched;

    res.json({
      success: true,
      data: {
        watched,
        notWatched,
        total,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Recently joined users (last 5) ──────────────────────────────────────────
router.get('/dashboard/recent', protectAdmin, async (req, res) => {
  try {
    const recent = await Customer.find()
      .select('fullName email jobTitle currentProfession dateOfBirth city district state createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format for frontend (optional - can also do formatting on frontend)
    const formatted = recent.map((user) => ({
      id: user._id.toString(),
      name: user.fullName || 'Unknown',
      email: user.email || '—',
      avatar: (user.fullName?.[0] || 'U').toUpperCase(),
      jobTitle: user.jobTitle || '—',
      profession: user.currentProfession || '—',
      dob: user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—',
      city: user.city || '—',
      district: user.district || '—',
      state: user.state || '—',
      joinedAt: user.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error('Recent users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update customer (e.g. mark webinar completed)
router.patch('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },           // { isWebinarCompleted: true }
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;