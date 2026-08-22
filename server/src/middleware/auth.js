import { verifyToken } from '../config/jwt.js';
import db from '../config/db.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }

  // Fetch fresh user record from DB
  const user = db.prepare(`
    SELECT u.id, u.employee_id, u.email, u.role, u.is_verified,
           p.first_name, p.last_name, p.avatar_url, p.department, p.designation
    FROM users u
    LEFT JOIN employee_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).get(decoded.id);

  if (!user) {
    return res.status(401).json({ error: 'User account not found' });
  }

  req.user = user;
  next();
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      const user = db.prepare(`
        SELECT u.id, u.employee_id, u.email, u.role, u.is_verified,
               p.first_name, p.last_name, p.avatar_url, p.department, p.designation
        FROM users u
        LEFT JOIN employee_profiles p ON u.id = p.user_id
        WHERE u.id = ?
      `).get(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}
