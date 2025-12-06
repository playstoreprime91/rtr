// script.js

const articlesDiv = document.getElementById('articles');
const detailSection = document.getElementById('article-detail');
const detailDiv = document.getElementById('detail');
const listSection = document.getElementById('articles-list');
const backBtn = document.getElementById('back-to-list');

backBtn.addEventListener('click', () => {
  detailSection.classList.add('hidden');
  listSection.classList.remove('hidden');
  loadArticles();
});

// --- Dodawanie artykułu ---
document.getElementById('article-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('article-title').value.trim();
  const author = document.getElementById('article-author').value.trim();
  const content = document.getElementById('article-content').value.trim();

  if (!title || !content) return alert('Wypełnij tytuł i treść');

  const { data, error } = await window.supabase
    .from('articles')
    .insert([{ title, author, content }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return alert('Błąd podczas dodawania artykułu');
  }

  document.getElementById('article-title').value = '';
  document.getElementById('article-author').value = '';
  document.getElementById('article-content').value = '';
  loadArticles();
});

// --- Ładowanie listy artykułów ---
async function loadArticles() {
  articlesDiv.innerHTML = '<p>Ładowanie...</p>';
  const { data, error } = await window.supabase
    .from('articles')
    .select('id,title,author,content,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    articlesDiv.innerHTML = '<p>Błąd ładowania artykułów</p>';
    return;
  }

  if (!data || data.length === 0) {
    articlesDiv.innerHTML = '<p>Brak artykułów. Dodaj pierwszy!</p>';
    return;
  }

  articlesDiv.innerHTML = '';
  data.forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(a.title)}</h3>
      <p class="meta">autor: ${escapeHtml(a.author || 'anonim')} • ${new Date(a.created_at).toLocaleString()}</p>
      <p class="excerpt">${escapeHtml(a.content.slice(0, 200))}${a.content.length > 200 ? '…' : ''}</p>
      <button data-id="${a.id}" class="view-btn">Pokaż szczegóły</button>
    `;
    articlesDiv.appendChild(card);
  });

  document.querySelectorAll('.view-btn').forEach(btn =>
    btn.addEventListener('click', (e) => showArticle(e.target.dataset.id))
  );
}

// --- Pokaż szczegóły artykułu z komentarzami ---
async function showArticle(articleId) {
  listSection.classList.add('hidden');
  detailSection.classList.remove('hidden');
  detailDiv.innerHTML = '<p>Ładowanie artykułu...</p>';

  const { data: article, error: aErr } = await window.supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (aErr || !article) {
    console.error(aErr);
    detailDiv.innerHTML = '<p>Nie znaleziono artykułu</p>';
    return;
  }

  const { data: comments, error: cErr } = await window.supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (cErr) console.error(cErr);

  const byId = {};
  (comments || []).forEach(c => byId[c.id] = { ...c, replies: [] });
  const topLevel = [];
  (comments || []).forEach(c => {
    if (c.parent_id) {
      if (byId[c.parent_id]) byId[c.parent_id].replies.push(byId[c.id]);
    } else {
      topLevel.push(byId[c.id]);
    }
  });

  detailDiv.innerHTML = `
    <article class="card">
      <h2>${escapeHtml(article.title)}</h2>
      <p class="meta">autor: ${escapeHtml(article.author || 'anonim')} • ${new Date(article.created_at).toLocaleString()}</p>
      <div class="content">${nl2br(escapeHtml(article.content))}</div>
    </article>

    <section id="comments-section">
      <h3>Komentarze</h3>

      <form id="comment-form" class="comment-form">
        <h4>Dodaj komentarz</h4>
        <label>Autor<input id="comment-author" required maxlength="100" /></label>
        <label>Treść<textarea id="comment-body" required rows="3"></textarea></label>
        <button type="submit">Dodaj komentarz</button>
      </form>

      <div id="comments-list">
        ${renderCommentsHtml(topLevel)}
      </div>
    </section>
  `;

  document.getElementById('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('comment-author').value.trim();
    const body = document.getElementById('comment-body').value.trim();
    if (!body) return alert('Wpisz treść komentarza');

    const { data, error } = await window.supabase
      .from('comments')
      .insert([{ article_id: articleId, author, body }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert('Błąd dodawania komentarza');
    }

    showArticle(articleId);
  });

  document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parentId = e.target.dataset.commentId;
      openReplyForm(parentId, articleId);
    });
  });
}

// --- Formularz odpowiedzi ---
function openReplyForm(parentId, articleId) {
  const parentEl = document.getElementById(`comment-${parentId}`);
  if (!parentEl) return;
  if (parentEl.querySelector('.reply-form')) return;

  const form = document.createElement('form');
  form.className = 'reply-form';
  form.innerHTML = `
    <label>Autor<input name="author" maxlength="100" /></label>
    <label>Treść<textarea name="body" rows="2" required></textarea></label>
    <div>
      <button type="submit">Wyślij odpowiedź</button>
      <button type="button" class="cancel-reply">Anuluj</button>
    </div>
  `;
  parentEl.appendChild(form);

  form.querySelector('.cancel-reply').addEventListener('click', () => form.remove());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = form.querySelector('input[name="author"]').value.trim();
    const body = form.querySelector('textarea[name="body"]').value.trim();
    if (!body) return alert('Wpisz treść odpowiedzi');

    const { data, error } = await window.supabase
      .from('comments')
      .insert([{ article_id: articleId, parent_id: parentId, author, body }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert('Błąd dodawania odpowiedzi');
      return;
    }

    showArticle(articleId);
  });
}

// --- Render komentarzy ---
function renderCommentsHtml(comments) {
  if (!comments || comments.length === 0) return '<p>Brak komentarzy — bądź pierwszy!</p>';
  return comments.map(c => `
    <div class="comment" id="comment-${c.id}">
      <p class="meta">${escapeHtml(c.author || 'anonim')} • ${new Date(c.created_at).toLocaleString()}</p>
      <div class="body">${nl2br(escapeHtml(c.body))}</div>
      <div class="comment-actions">
        <button class="reply-btn" data-comment-id="${c.id}">Odpowiedz</button>
      </div>
      ${c.replies && c.replies.length ? `<div class="replies">${c.replies.map(r => `
        <div class="reply" id="comment-${r.id}">
          <p class="meta">${escapeHtml(r.author || 'anonim')} • ${new Date(r.created_at).toLocaleString()}</p>
          <div class="body">${nl2br(escapeHtml(r.body))}</div>
        </div>
      `).join('')}</div>` : ''}
    </div>
  `).join('');
}

// --- Helpers ---
function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function nl2br(s = '') {
  return s.replace(/\n/g, '<br/>');
}

// --- start ---
loadArticles();
