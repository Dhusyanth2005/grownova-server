import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.admin = await AdminUser.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized - admin not found' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized - invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized - no token' });
  }
};