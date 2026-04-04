const pool = require('../config/db');

// Service admin endpoints removed — service feature deleted.
exports.listPendingServices = async (req, res) => {
  res.status(410).json({ error: 'Service feature removed' });
};

exports.approveService = async (req, res) => {
  res.status(410).json({ error: 'Service feature removed' });
};

exports.rejectService = async (req, res) => {
  res.status(410).json({ error: 'Service feature removed' });
};
