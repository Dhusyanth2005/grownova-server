// src/routes/webinar.js
import express from 'express';
import Webinar from '../models/Webinar.js';
import { protectAdmin } from '../middleware/authAdmin.js';

const router = express.Router();

// GET current/active webinar (public - everyone can see the link)
router.get('/', async (req, res) => {
  try {
    // Get the most recently updated active webinar (or any active one)
    const webinar = await Webinar.findOne({ isActive: true })
      .sort({ updatedAt: -1 })
      .lean();

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: 'No active webinar found'
      });
    }

    res.json({
      success: true,
      data: webinar
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// CREATE or UPDATE webinar (admin only)
// Use PUT for upsert style (create if not exists, update if exists)
router.put(
  '/',
   protectAdmin,  // ← uncomment when you want to protect this route
  async (req, res) => {
    try {
      const { webinarLink, whatsappNo } = req.body;

      if (!webinarLink || !whatsappNo) {
        return res.status(400).json({
          success: false,
          message: 'webinarLink and whatsappNo are required'
        });
      }

      // Find existing active one or create new
      let webinar = await Webinar.findOne({ isActive: true });

      if (webinar) {
        // Update existing
        webinar.webinarLink = webinarLink;
        webinar.whatsappNo = whatsappNo;
        webinar.updatedAt = Date.now();
        await webinar.save();
      } else {
        // Create new one (and deactivate others if any)
        webinar = new Webinar({
          webinarLink,
          whatsappNo,
          isActive: true
        });
        await webinar.save();
      }

      res.status(200).json({
        success: true,
        message: webinar ? 'Webinar updated' : 'Webinar created',
        data: webinar
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: 'Failed to save webinar',
        error: err.message
      });
    }
  }
);

export default router;