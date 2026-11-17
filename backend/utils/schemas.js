// schemas.js - describes the fields of every content type.
// The same description is used in three places:
//   1. the backend validator (utils/validators.js),
//   2. the admin dashboard, which builds its forms from it (GET /api/admin/schema),
//   3. documentation: this is the one file to read to see what each record contains.
//
// Field options: name, label, type, required, max, options (for "select"), help.
// Types: string, text, date, image, number, boolean, select, email, phone.

const resources = {
  news: {
    collection: 'news',
    label: 'News article',
    listColumns: ['title', 'category', 'publishedAt', 'published'],
    sortBy: 'publishedAt',
    sortDirection: 'desc',
    publicFilter: function (item) { return item.published !== false; },
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true, max: 150 },
      { name: 'category', label: 'Category', type: 'select', required: true,
        options: ['Announcement', 'Community', 'Education', 'Leadership', 'Peace and Unity', 'Culture'] },
      { name: 'author', label: 'Author', type: 'string', required: true, max: 80 },
      { name: 'publishedAt', label: 'Publication date', type: 'date', required: true },
      { name: 'image', label: 'Featured image', type: 'image', max: 300 },
      { name: 'summary', label: 'Short summary', type: 'text', required: true, max: 300 },
      { name: 'content', label: 'Article content', type: 'text', required: true, max: 10000,
        help: 'Leave a blank line between paragraphs.' },
      { name: 'published', label: 'Published (visible on website)', type: 'boolean' },
      { name: 'isDemo', label: 'Demonstration content (not real news)', type: 'boolean' }
    ]
  },
  events: {
    collection: 'events',
    label: 'Event',
    listColumns: ['title', 'date', 'location'],
    sortBy: 'date',
    sortDirection: 'desc',
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true, max: 150 },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time (optional)', type: 'string', max: 40 },
      { name: 'location', label: 'Location', type: 'string', required: true, max: 150 },
      { name: 'description', label: 'Description', type: 'text', required: true, max: 3000 },
      { name: 'image', label: 'Event photograph', type: 'image', max: 300 },
      { name: 'isDemo', label: 'Demonstration content (not a real event)', type: 'boolean' }
    ]
  },
  leadership: {
    collection: 'leadership',
    label: 'Leadership profile',
    listColumns: ['name', 'position', 'group', 'order'],
    sortBy: 'order',
    sortDirection: 'asc',
    fields: [
      { name: 'name', label: 'Full name', type: 'string', required: true, max: 100 },
      { name: 'position', label: 'Position', type: 'string', required: true, max: 100 },
      { name: 'group', label: 'Group', type: 'select', required: true,
        options: ['Executive Committee', 'Advisory Committee', 'Other Committee Members'] },
      { name: 'photo', label: 'Photograph', type: 'image', max: 300 },
      { name: 'bio', label: 'Short biography', type: 'text', max: 1500 },
      { name: 'responsibilities', label: 'Responsibilities', type: 'text', max: 1500 },
      { name: 'order', label: 'Display order (1 = first)', type: 'number', required: true },
      { name: 'isPlaceholder', label: 'Placeholder (not yet confirmed)', type: 'boolean' }
    ]
  },
  programs: {
    collection: 'programs',
    label: 'Program',
    listColumns: ['title', 'status', 'order'],
    sortBy: 'order',
    sortDirection: 'asc',
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true, max: 100 },
      { name: 'status', label: 'Status', type: 'select', required: true,
        options: ['Proposed focus area', 'Ongoing', 'Completed'] },
      { name: 'description', label: 'Description', type: 'text', required: true, max: 2000 },
      { name: 'image', label: 'Image', type: 'image', max: 300 },
      { name: 'order', label: 'Display order (1 = first)', type: 'number', required: true }
    ]
  },
  gallery: {
    collection: 'gallery',
    label: 'Gallery image',
    listColumns: ['title', 'category'],
    sortBy: 'createdAt',
    sortDirection: 'desc',
    fields: [
      { name: 'title', label: 'Title', type: 'string', required: true, max: 120 },
      { name: 'category', label: 'Category', type: 'select', required: true,
        options: ['Meetings', 'Cultural events', 'Community activities', 'Leadership activities', 'Sports and social events'] },
      { name: 'image', label: 'Image', type: 'image', required: true, max: 300 },
      { name: 'caption', label: 'Caption', type: 'string', max: 250 },
      { name: 'isPlaceholder', label: 'Placeholder image (not a real photograph)', type: 'boolean' }
    ]
  },
  branches: {
    collection: 'branches',
    label: 'Branch',
    listColumns: ['name', 'country', 'status'],
    sortBy: 'order',
    sortDirection: 'asc',
    fields: [
      { name: 'name', label: 'Branch name', type: 'string', required: true, max: 120 },
      { name: 'country', label: 'Country', type: 'string', required: true, max: 60 },
      { name: 'location', label: 'Location', type: 'string', max: 120 },
      { name: 'status', label: 'Status', type: 'select', required: true,
        options: ['Main branch', 'Active (confirmed by RUMYU)', 'Historically documented - current status unverified'] },
      { name: 'description', label: 'Description', type: 'text', required: true, max: 2000 },
      { name: 'leadership', label: 'Leadership information', type: 'text', max: 600 },
      { name: 'activities', label: 'Activities', type: 'text', max: 1500 },
      { name: 'contact', label: 'Contact information', type: 'text', max: 400 },
      { name: 'sources', label: 'Sources (see RESEARCH-SOURCES.md)', type: 'string', max: 300 },
      { name: 'order', label: 'Display order (1 = first)', type: 'number', required: true }
    ]
  }
};

// Forms that visitors submit. These are NOT editable by admins, only readable.
const submissions = {
  membership: {
    collection: 'membership',
    label: 'Membership enquiry',
    fields: [
      { name: 'fullName', label: 'Full name', type: 'string', required: true, max: 100 },
      { name: 'email', label: 'Email', type: 'email', required: true, max: 120 },
      { name: 'phone', label: 'Telephone', type: 'phone', required: true, max: 30 },
      { name: 'country', label: 'Country', type: 'string', required: true, max: 60 },
      { name: 'area', label: 'Area of residence', type: 'string', required: true, max: 100 },
      { name: 'message', label: 'Message', type: 'text', required: true, max: 2000 }
    ]
  },
  contact: {
    collection: 'contact',
    label: 'Contact message',
    fields: [
      { name: 'name', label: 'Name', type: 'string', required: true, max: 100 },
      { name: 'email', label: 'Email', type: 'email', required: true, max: 120 },
      { name: 'subject', label: 'Subject', type: 'string', required: true, max: 150 },
      { name: 'message', label: 'Message', type: 'text', required: true, max: 3000 }
    ]
  }
};

module.exports = { resources, submissions };
