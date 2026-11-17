// validators.js - checks incoming data against a schema (see schemas.js).
// Returns { errors, data, isValid }. "data" contains ONLY the fields listed in the
// schema, trimmed and converted to the right type, so unexpected extra fields are dropped.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+()\d][\d\s().-]{6,28}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// An image is either a site path such as /uploads/photo.jpg or a full https:// address.
const IMAGE_PATTERN = /^(\/[A-Za-z0-9._\-\/]+|https?:\/\/[^\s"'<>]+)$/;

function isRealDate(text) {
  if (!DATE_PATTERN.test(text)) {
    return false;
  }
  const parsed = new Date(text + 'T00:00:00Z');
  return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text;
}

function validateField(field, rawValue) {
  const isEmpty = rawValue === undefined || rawValue === null || String(rawValue).trim() === '';

  if (field.type === 'boolean') {
    return { value: rawValue === true || rawValue === 'true' };
  }
  if (isEmpty) {
    if (field.required) {
      return { error: field.label + ' is required.' };
    }
    return { value: field.type === 'number' ? 0 : '' };
  }

  // Values must be text or numbers (this rejects objects and arrays).
  if (typeof rawValue !== 'string' && typeof rawValue !== 'number') {
    return { error: field.label + ' has an invalid value.' };
  }
  const value = String(rawValue).trim();

  if (field.max && value.length > field.max) {
    return { error: field.label + ' must be ' + field.max + ' characters or fewer.' };
  }

  switch (field.type) {
    case 'email':
      if (!EMAIL_PATTERN.test(value)) {
        return { error: 'Please enter a valid email address.' };
      }
      return { value: value.toLowerCase() };
    case 'phone':
      if (!PHONE_PATTERN.test(value)) {
        return { error: 'Please enter a valid telephone number.' };
      }
      return { value: value };
    case 'date':
      if (!isRealDate(value)) {
        return { error: field.label + ' must be a valid date (YYYY-MM-DD).' };
      }
      return { value: value };
    case 'number':
      if (!isFinite(Number(value))) {
        return { error: field.label + ' must be a number.' };
      }
      return { value: Number(value) };
    case 'select':
      if (field.options.indexOf(value) === -1) {
        return { error: field.label + ' must be one of: ' + field.options.join(', ') + '.' };
      }
      return { value: value };
    case 'image':
      if (value.indexOf('..') !== -1 || value.indexOf('//') === 0 || !IMAGE_PATTERN.test(value)) {
        return { error: field.label + ' must be a site path (like /uploads/photo.jpg) or an https:// link.' };
      }
      return { value: value };
    default:
      return { value: value };
  }
}

function validateAgainstSchema(fields, body) {
  const errors = {};
  const data = {};
  const input = body && typeof body === 'object' ? body : {};

  fields.forEach(function (field) {
    const result = validateField(field, input[field.name]);
    if (result.error) {
      errors[field.name] = result.error;
    } else {
      data[field.name] = result.value;
    }
  });

  return { errors: errors, data: data, isValid: Object.keys(errors).length === 0 };
}

module.exports = { validateAgainstSchema, isRealDate };
