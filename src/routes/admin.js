import express from 'express';
import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import { protectAdmin } from '../middleware/authAdmin.js';
import bcrypt from 'bcryptjs';
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await AdminUser.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current admin (protected)
router.get('/me', protectAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

router.patch('/change-password', protectAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Get the current admin from middleware (protectAdmin sets req.admin)
    const admin = await AdminUser.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Validate new password strength (optional but recommended)
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
});
export default router;