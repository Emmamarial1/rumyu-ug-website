// events.js - upcoming / previous events with search. Works on events.html and index.html.

let allEvents = [];
let eventsView = 'upcoming'; // or 'previous'

function eventCardHtml(event) {
  const date = new Date(event.date + 'T00:00:00');
  const day = isNaN(date) ? '' : date.getDate();
  const month = isNaN(date) ? '' : date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return '<article class="card reveal">' +
    '<img src="' + escapeHtml(safeImage(event.image)) + '" alt="" loading="lazy">' +
    '<div class="card-body"><div class="event-date">' + day + '<small>' + escapeHtml(month) + '</small></div>' +
    '<h3>' + escapeHtml(event.title) + (event.isDemo ? ' <span class="tag warn">Demo</span>' : '') + '</h3>' +
    '<div class="meta"><span>Location: ' + escapeHtml(event.location) + '</span>' +
    (event.time ? '<span>Time: ' + escapeHtml(event.time) + '</span>' : '') + '</div>' +
    '<p>' + escapeHtml(event.description) + '</p></div></article>';
}

function splitEvents(events) {
  const today = todayIso();
  const upcoming = events.filter(function (e) { return e.date >= today; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });   // soonest first
  const previous = events.filter(function (e) { return e.date < today; })
    .sort(function (a, b) { return a.date < b.date ? 1 : -1; });   // most recent first
  return { upcoming: upcoming, previous: previous };
}

function renderEventsPage() {
  const container = document.getElementById('events-list');
  const query = document.getElementById('events-search').value.trim().toLowerCase();
  const groups = splitEvents(allEvents);
  const list = groups[eventsView].filter(function (e) {
    return query === '' || (e.title + ' ' + e.location + ' ' + e.description).toLowerCase().indexOf(query) !== -1;
  });
  if (list.length === 0) {
    showEmpty(container, eventsView === 'upcoming' ? 'No upcoming events match. Please check back soon.' : 'No previous events to show.');
    return;
  }
  container.innerHTML = list.map(eventCardHtml).join('');
  observeReveal(container);
}

function loadEvents() {
  const pageList = document.getElementById('events-list');
  const homeList = document.getElementById('home-events');
  const container = pageList || homeList;
  if (!container) { return; }

  showLoading(container);
  apiGet('/events').then(function (events) {
    allEvents = events;
    if (homeList) {
      const upcoming = splitEvents(events).upcoming.slice(0, 3);
      if (upcoming.length === 0) { showEmpty(homeList, 'No upcoming events have been announced yet.'); return; }
      homeList.innerHTML = upcoming.map(eventCardHtml).join('');
      observeReveal(homeList);
      return;
    }
    document.querySelectorAll('[data-events-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        eventsView = button.dataset.eventsView;
        document.querySelectorAll('[data-events-view]').forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });
        renderEventsPage();
      });
    });
    document.getElementById('events-search').addEventListener('input', renderEventsPage);
    renderEventsPage();
  }).catch(function (error) {
    showError(container, error.message, loadEvents);
  });
}

document.addEventListener('DOMContentLoaded', loadEvents);
