// resourceController.js - one reusable set of list / get / create / update / delete
// handlers. routes/index.js calls createResourceController() once for news, events,
// leadership, programs, gallery and branches, so we do not repeat the same code.

const store = require('../services/jsonStore');
const { validateAgainstSchema } = require('../utils/validators');

function sortItems(items, config) {
  const direction = config.sortDirection === 'desc' ? -1 : 1;
  return items.slice().sort(function (a, b) {
    const first = a[config.sortBy];
    const second = b[config.sortBy];
    if (first === second) { return 0; }
    return (first > second ? 1 : -1) * direction;
  });
}

function createResourceController(config) {
  function list(req, res) {
    let items = store.findAll(config.collection);
    const isAdmin = Boolean(req.session && req.session.adminId);
    // Visitors never see unpublished items (for example draft news).
    if (config.publicFilter && !isAdmin) {
      items = items.filter(config.publicFilter);
    }
    res.json(sortItems(items, config));
  }

  function getOne(req, res) {
    const item = store.findById(config.collection, req.params.id);
    const isAdmin = Boolean(req.session && req.session.adminId);
    if (!item || (config.publicFilter && !isAdmin && !config.publicFilter(item))) {
      return res.status(404).json({ error: config.label + ' not found.' });
    }
    return res.json(item);
  }

  function create(req, res) {
    const result = validateAgainstSchema(config.fields, req.body);
    if (!result.isValid) {
      return res.status(422).json({ error: 'Please correct the highlighted fields.', fields: result.errors });
    }
    return res.status(201).json(store.create(config.collection, result.data));
  }

  function update(req, res) {
    const result = validateAgainstSchema(config.fields, req.body);
    if (!result.isValid) {
      return res.status(422).json({ error: 'Please correct the highlighted fields.', fields: result.errors });
    }
    const updated = store.update(config.collection, req.params.id, result.data);
    if (!updated) {
      return res.status(404).json({ error: config.label + ' not found.' });
    }
    return res.json(updated);
  }

  function remove(req, res) {
    if (!store.remove(config.collection, req.params.id)) {
      return res.status(404).json({ error: config.label + ' not found.' });
    }
    return res.status(204).end();
  }

  return { list: list, getOne: getOne, create: create, update: update, remove: remove };
}

module.exports = { createResourceController, sortItems };
