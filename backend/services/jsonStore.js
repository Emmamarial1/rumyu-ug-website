// jsonStore.js - a very small "database" that keeps each collection in one JSON file.
// All functions are synchronous on purpose: Node runs one JavaScript task at a time,
// so synchronous read-modify-write cannot be interrupted by another request.
// When the website grows, replace this file with a real database (SQLite, PostgreSQL...)
// and keep the same function names so the controllers do not need to change.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(collection) {
  return path.join(DATA_DIR, collection + '.json');
}

// Read every record in a collection. A missing file is treated as an empty list.
function findAll(collection) {
  try {
    const raw = fs.readFileSync(filePath(collection), 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write to a temporary file first and then rename it, so a crash in the middle of
// saving can never leave a half-written (corrupted) JSON file behind.
function writeAll(collection, items) {
  const target = filePath(collection);
  const temporary = target + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(items, null, 2), 'utf8');
  fs.renameSync(temporary, target);
}

function findById(collection, id) {
  return findAll(collection).find(function (item) {
    return item.id === id;
  }) || null;
}

function create(collection, data) {
  const items = findAll(collection);
  const now = new Date().toISOString();
  const record = Object.assign({ id: crypto.randomUUID() }, data, { createdAt: now, updatedAt: now });
  items.push(record);
  writeAll(collection, items);
  return record;
}

function update(collection, id, data) {
  const items = findAll(collection);
  const index = items.findIndex(function (item) {
    return item.id === id;
  });
  if (index === -1) {
    return null;
  }
  // Keep id and createdAt, replace everything else that was sent.
  items[index] = Object.assign({}, items[index], data, {
    id: items[index].id,
    createdAt: items[index].createdAt,
    updatedAt: new Date().toISOString()
  });
  writeAll(collection, items);
  return items[index];
}

function remove(collection, id) {
  const items = findAll(collection);
  const remaining = items.filter(function (item) {
    return item.id !== id;
  });
  if (remaining.length === items.length) {
    return false;
  }
  writeAll(collection, remaining);
  return true;
}

module.exports = { findAll, writeAll, findById, create, update, remove };
