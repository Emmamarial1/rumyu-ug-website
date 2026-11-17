// submissionController.js - membership enquiries and contact messages.
// Visitors may only CREATE them. Administrators may read, mark as read, and delete.

const store = require('../services/jsonStore');
const { validateAgainstSchema } = require('../utils/validators');

function createSubmissionController(config) {
  // Public: POST /api/membership or /api/contact
  function create(req, res) {
    // Honeypot: real people never see the hidden "website" field, simple spam bots fill it in.
    // We pretend it worked so the bot does not learn anything.
    if (req.body && typeof req.body.website === 'string' && req.body.website.trim() !== '') {
      return res.status(201).json({ message: 'Received.' });
    }
    const result = validateAgainstSchema(config.fields, req.body);
    if (!result.isValid) {
      return res.status(422).json({ error: 'Please correct the highlighted fields.', fields: result.errors });
    }
    store.create(config.collection, Object.assign({}, result.data, { status: 'new' }));
    return res.status(201).json({ message: 'Received.' });
  }

  // Admin: newest first.
  function list(req, res) {
    const items = store.findAll(config.collection).sort(function (a, b) {
      return a.createdAt < b.createdAt ? 1 : -1;
    });
    res.json(items);
  }

  // Admin: PATCH { status: 'new' | 'read' }
  function setStatus(req, res) {
    const status = req.body && req.body.status;
    if (status !== 'new' && status !== 'read') {
      return res.status(422).json({ error: 'Status must be "new" or "read".' });
    }
    const updated = store.update(config.collection, req.params.id, { status: status });
    if (!updated) {
      return res.status(404).json({ error: 'Not found.' });
    }
    return res.json(updated);
  }

  function remove(req, res) {
    if (!store.remove(config.collection, req.params.id)) {
      return res.status(404).json({ error: 'Not found.' });
    }
    return res.status(204).end();
  }

  return { create: create, list: list, setStatus: setStatus, remove: remove };
}

module.exports = { createSubmissionController };
