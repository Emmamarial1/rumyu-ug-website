// news.js - news list, search/filter, and the "Read more" article window.
// Works on news.html (full list) and index.html (latest three).

let allNews = [];

function newsCardHtml(article) {
  return '<article class="card reveal">' +
    '<img src="' + escapeHtml(safeImage(article.image)) + '" alt="" loading="lazy">' +
    '<div class="card-body"><div class="meta"><span class="tag">' + escapeHtml(article.category) + '</span>' +
    '<span>' + escapeHtml(formatDate(article.publishedAt)) + '</span>' +
    (article.isDemo ? '<span class="tag warn">Demo</span>' : '') + '</div>' +
    '<h3>' + escapeHtml(article.title) + '</h3><p>' + escapeHtml(article.summary) + '</p>' +
    '<a class="btn btn-outline-dark" href="/news.html#article-' + escapeHtml(article.id) + '" data-article="' + escapeHtml(article.id) + '">Read more</a>' +
    '</div></article>';
}

function renderNewsList(container, articles) {
  if (articles.length === 0) {
    showEmpty(container, 'No news articles match your search.');
    return;
  }
  container.innerHTML = articles.map(newsCardHtml).join('');
  observeReveal(container);
}

// Show one article in the <dialog id="article-dialog"> element.
function openArticle(id) {
  const dialog = document.getElementById('article-dialog');
  const article = allNews.find(function (item) { return item.id === id; });
  if (!dialog || !article) { return; }
  dialog.querySelector('.dialog-content').innerHTML =
    '<img src="' + escapeHtml(safeImage(article.image)) + '" alt="">' +
    '<div class="meta"><span class="tag">' + escapeHtml(article.category) + '</span><span>' + escapeHtml(formatDate(article.publishedAt)) +
    '</span><span>By ' + escapeHtml(article.author) + '</span>' + (article.isDemo ? '<span class="tag warn">Demonstration content</span>' : '') + '</div>' +
    '<h2>' + escapeHtml(article.title) + '</h2>' + textToParagraphs(article.content);
  if (!dialog.open) { dialog.showModal(); }
}

function applyNewsFilters() {
  const query = document.getElementById('news-search').value.trim().toLowerCase();
  const category = document.getElementById('news-category').value;
  const filtered = allNews.filter(function (article) {
    const matchesCategory = category === '' || article.category === category;
    const text = (article.title + ' ' + article.summary + ' ' + article.content).toLowerCase();
    return matchesCategory && (query === '' || text.indexOf(query) !== -1);
  });
  renderNewsList(document.getElementById('news-list'), filtered);
}

function setupNewsPage(container) {
  const select = document.getElementById('news-category');
  const categories = allNews.map(function (a) { return a.category; }).filter(function (c, i, list) { return list.indexOf(c) === i; });
  categories.forEach(function (category) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  document.getElementById('news-search').addEventListener('input', applyNewsFilters);
  select.addEventListener('change', applyNewsFilters);

  const dialog = document.getElementById('article-dialog');
  dialog.querySelector('.dialog-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) { dialog.close(); } }); // click on backdrop
  dialog.addEventListener('close', function () { history.replaceState(null, '', '/news.html'); });
  container.addEventListener('click', function (event) {
    const link = event.target.closest('[data-article]');
    if (link) { event.preventDefault(); history.replaceState(null, '', '#article-' + link.dataset.article); openArticle(link.dataset.article); }
  });
  if (window.location.hash.indexOf('#article-') === 0) { openArticle(window.location.hash.slice('#article-'.length)); }
}

function loadNews() {
  const pageList = document.getElementById('news-list');
  const homeList = document.getElementById('home-news');
  const container = pageList || homeList;
  if (!container) { return; }

  showLoading(container);
  apiGet('/news').then(function (articles) {
    allNews = articles;
    if (pageList) {
      if (articles.length === 0) { showEmpty(pageList, 'No news has been published yet.'); return; }
      renderNewsList(pageList, articles);
      setupNewsPage(pageList);
    } else {
      if (articles.length === 0) { showEmpty(homeList, 'No news has been published yet.'); return; }
      renderNewsList(homeList, articles.slice(0, 3));
    }
  }).catch(function (error) {
    showError(container, error.message, loadNews);
  });
}

document.addEventListener('DOMContentLoaded', loadNews);
