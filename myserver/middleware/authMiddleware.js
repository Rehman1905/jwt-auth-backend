const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tapılmadı' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'İstifadəçi tapılmadı' });

    req.user = {
  _id: user._id,
  email: user.email,
  role: user.role
}
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token etibarsızdır' });
  }
};
