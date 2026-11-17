// content.js - leadership profiles, programs and branches. Fills the containers that exist on the page.

function leaderCardHtml(leader) {
  const details = (leader.bio || leader.responsibilities)
    ? '<details><summary>Biography and responsibilities</summary>' +
      (leader.bio ? '<p>' + escapeHtml(leader.bio) + '</p>' : '') +
      (leader.responsibilities ? '<p><strong>Responsibilities:</strong> ' + escapeHtml(leader.responsibilities) + '</p>' : '') + '</details>'
    : '';
  return '<article class="card leader-card reveal"><img src="' + escapeHtml(safeImage(leader.photo, '/assets/images/avatar.svg')) + '" alt="" loading="lazy">' +
    '<div class="card-body"><h3>' + escapeHtml(leader.name) + '</h3><div class="position">' + escapeHtml(leader.position) + '</div>' +
    (leader.isPlaceholder ? '<div><span class="tag warn">Placeholder - to be confirmed</span></div>' : '') + details + '</div></article>';
}

function loadLeadership() {
  const groupsBox = document.getElementById('leadership-groups');
  const homeBox = document.getElementById('home-leaders');
  const container = groupsBox || homeBox;
  if (!container) { return; }

  showLoading(container);
  apiGet('/leadership').then(function (leaders) {
    if (leaders.length === 0) { showEmpty(container, 'Leadership profiles will be added soon.'); return; }
    if (homeBox) {
      homeBox.innerHTML = leaders.slice(0, 4).map(leaderCardHtml).join('');
      observeReveal(homeBox);
      return;
    }
    const groupNames = ['Executive Committee', 'Advisory Committee', 'Other Committee Members'];
    groupsBox.innerHTML = groupNames.map(function (group) {
      const members = leaders.filter(function (l) { return l.group === group; });
      if (members.length === 0) { return ''; }
      return '<section class="section-block"><h2>' + escapeHtml(group) + '</h2><div class="grid grid-4">' + members.map(leaderCardHtml).join('') + '</div></section>';
    }).join('');
    observeReveal(groupsBox);
  }).catch(function (error) {
    showError(container, error.message, loadLeadership);
  });
}

function programCardHtml(program) {
  return '<article class="card reveal"><img src="' + escapeHtml(safeImage(program.image)) + '" alt="" loading="lazy">' +
    '<div class="card-body"><div class="meta"><span class="tag ' + (program.status === 'Proposed focus area' ? 'warn' : 'gold') + '">' + escapeHtml(program.status) + '</span></div>' +
    '<h3>' + escapeHtml(program.title) + '</h3><p>' + escapeHtml(program.description) + '</p></div></article>';
}

function loadPrograms() {
  const pageBox = document.getElementById('programs-list');
  const homeBox = document.getElementById('home-programs');
  const container = pageBox || homeBox;
  if (!container) { return; }

  showLoading(container);
  apiGet('/programs').then(function (programs) {
    if (programs.length === 0) { showEmpty(container, 'Programs will be added soon.'); return; }
    container.innerHTML = (homeBox ? programs.slice(0, 4) : programs).map(programCardHtml).join('');
    observeReveal(container);
  }).catch(function (error) {
    showError(container, error.message, loadPrograms);
  });
}

function branchCardHtml(branch) {
  const unverified = branch.status.indexOf('Historically') === 0;
  return '<article class="card reveal"><div class="card-body">' +
    '<div class="meta"><span class="tag ' + (unverified ? 'warn' : 'gold') + '">' + escapeHtml(branch.status) + '</span></div>' +
    '<h3>' + escapeHtml(branch.name) + '</h3>' +
    '<div class="meta"><span>' + escapeHtml(branch.country) + (branch.location ? ' - ' + escapeHtml(branch.location) : '') + '</span></div>' +
    '<p>' + escapeHtml(branch.description) + '</p>' +
    (branch.leadership ? '<p><strong>Leadership:</strong> ' + escapeHtml(branch.leadership) + '</p>' : '') +
    (branch.activities ? '<p><strong>Activities:</strong> ' + escapeHtml(branch.activities) + '</p>' : '') +
    (branch.contact ? '<p><strong>Contact:</strong> ' + escapeHtml(branch.contact) + '</p>' : '') +
    (branch.sources ? '<p class="help"><em>Sources: ' + escapeHtml(branch.sources) + '</em></p>' : '') + '</div></article>';
}

function loadBranches() {
  const container = document.getElementById('branches-list');
  if (!container) { return; }
  showLoading(container);
  apiGet('/branches').then(function (branches) {
    if (branches.length === 0) { showEmpty(container, 'Branch information will be added soon.'); return; }
    container.innerHTML = branches.map(branchCardHtml).join('');
    observeReveal(container);
  }).catch(function (error) {
    showError(container, error.message, loadBranches);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadLeadership();
  loadPrograms();
  loadBranches();
});
