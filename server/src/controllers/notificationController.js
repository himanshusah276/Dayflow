import db from '../config/db.js';

export const getNotifications = (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId);

    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).count;

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

export const markAsRead = (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = parseInt(req.params.id, 10);

    db.prepare(`
      UPDATE notifications SET is_read = 1
      WHERE id = ? AND user_id = ?
    `).run(notifId, userId);

    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
};

export const markAllAsRead = (req, res) => {
  try {
    const userId = req.user.id;

    db.prepare(`
      UPDATE notifications SET is_read = 1
      WHERE user_id = ?
    `).run(userId);

    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    return res.status(500).json({ error: 'Failed to clear notifications.' });
  }
};

export const getAnnouncements = (req, res) => {
  try {
    const announcements = db.prepare(`
      SELECT * FROM announcements
      ORDER BY is_pinned DESC, created_at DESC
      LIMIT 10
    `).all();

    return res.json({ announcements });
  } catch (error) {
    console.error('getAnnouncements error:', error);
    return res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
};

export const createAnnouncement = (req, res) => {
  try {
    const { title, content, category, isPinned } = req.body;
    const authorName = `${req.user.first_name} ${req.user.last_name}`;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const result = db.prepare(`
      INSERT INTO announcements (title, content, category, is_pinned, author_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category || 'General', isPinned ? 1 : 0, authorName);

    // Also push notification to all users
    const allUsers = db.prepare('SELECT id FROM users').all();
    for (const u of allUsers) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, 'New Company Announcement: ' || ?, ?, 'system')
      `).run(u.id, title, content.slice(0, 100) + '...');
    }

    return res.status(201).json({
      message: 'Announcement published successfully.',
      announcementId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('createAnnouncement error:', error);
    return res.status(500).json({ error: 'Failed to publish announcement.' });
  }
};
