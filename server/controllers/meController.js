const {
  getUserProfile,
  updateUserProfile,
  deleteUser
} = require('../services/meService');

async function getMe(req, res) {
  /* GET /me */
  try {
    const userId = req.user.id;
    const role = req.user.role; // 0 = provider, 1 = patient
    const profile = await getUserProfile(userId, role);
    res.json(profile);
  } catch (err) {
    console.error('DB error:', err);
    res.status(404).json({ error: 'User not found' });
  }
}

async function patchMe(req, res) {
  /* PATCH /me */

  try {
    const userId = req.user.id;
    const role = req.user.role;

    const updated = await updateUserProfile(userId, role, req.body);
    res.json({ updated });
  } catch (err) {
    if (err.message === 'No valid fields to update') {
      res.status(400).json({ error: err.message });
    } else {
      console.error('Update error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

async function deleteMe(req, res) {
  /* DELETE /me */

  try {
    const userId = req.user.id;
    const role = req.user.role;

    const success = await deleteUser(userId, role);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}

module.exports = {
  getMe,
  patchMe,
  deleteMe
}