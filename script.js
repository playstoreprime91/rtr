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

document.getElementById('article-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('article-title').value.trim();
  const author = document.getElementById('article-author').value.trim();
  const content = document.getElementById('article-content').value.trim();

  if (!title || !content) return alert('Wypełnij tytuł i treść');

  await window.supabase.from('articles').insert([{ title, author, content }]);

  loadArticles();
});


async function loadArticles() {
  articlesDiv.innerHTML = '<p>Ładowanie...</p>';

  const { data } = await window.supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) {
    articlesDiv.innerHTML = '<p>Brak artykułów</p>';
    return;
  }

  articlesDiv.innerHTML = '';
  data.forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(a.title)}</h3>
      <p class="meta">${escapeHtml(a.author || 'anonim')} • ${new Date(a.created_at).toLocaleString()}</p>

      <p class="excerpt">${escapeHtml(a.content.slice(0, 200))}${a.content.length > 200 ? '…' : ''}</p>

      <button data-id="${a.id}" class="view-btn">Komentarze</button>
    `;
    articlesDiv.appendChild(card);
  });

  document.querySelectorAll('.view-btn').forEach(btn =>
    btn.addEventListener('click', () => showArticle(btn.dataset.id))
  );
}

async function showArticle(articleId) {
  listSection.classList.add('hidden');
  detailSection.classList.remove('hidden');

  detailDiv.innerHTML = '<p>Ładowanie...</p>';

  const { data: article } = await window.supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  const { data: comments } = await window.supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  const byId = {};
  comments?.forEach(c => (byId[c.id] = { ...c, replies: [] }));

  const top = [];
  comments?.forEach(c => {
    if (c.parent_id) byId[c.parent_id]?.replies.push(byId[c.id]);
    else top.push(byId[c.id]);
  });

  detailDiv.innerHTML = `
    <article class="card">
      <h2>${escapeHtml(article.title)}</h2>
      <p class="meta">${escapeHtml(article.author || 'anonim')} • ${new Date(article.created_at).toLocaleString()}</p>
      <div>${nl2br(escapeHtml(article.content))}</div>
    </article>

    <section id="comments-section">
      <h3>Komentarze</h3>

      <form id="comment-form" class="comment-form">
        <h4>Dodaj komentarz</h4>
        <label>Autor<input id="comment-author" maxlength="100" /></label>
        <label>Treść<textarea id="comment-body" rows="3" required></textarea></label>
        <button type="submit">Dodaj komentarz</button>
      </form>

      <div id="comments-list">
        ${renderCommentsHtml(top)}
      </div>
    </section>
  `;

  document.getElementById('comment-form').addEventListener('submit', async e => {
    e.preventDefault();
    const author = document.getElementById('comment-author').value.trim();
    const body = document.getElementById('comment-body').value.trim();

    await window.supabase.from('comments').insert([
      { article_id: articleId, author, body }
    ]);

    showArticle(articleId);
  });

  document.querySelectorAll('.reply-btn').forEach(btn =>
    btn.addEventListener('click', e =>
      openReplyForm(e.target.dataset.commentId, articleId)
    )
  );
}

function openReplyForm(parentId, articleId) {
  const container = document.getElementById(`comment-${parentId}`);
  if (!container || container.querySelector('.reply-form')) return;

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

  container.appendChild(form);

  form.querySelector('.cancel-reply').onclick = () => form.remove();

  form.onsubmit = async e => {
    e.preventDefault();
    const author = form.author.value.trim();
    const body = form.body.value.trim();

    await window.supabase.from('comments').insert([
      { article_id: articleId, parent_id: parentId, author, body }
    ]);

    showArticle(articleId);
  };
}

function renderCommentsHtml(comments, level = 0) {
  if (!comments || comments.length === 0)
    return level === 0 ? '<p>Brak komentarzy — bądź pierwszy!</p>' : '';

  return comments
    .map(
      c => `
      <div class="comment" id="comment-${c.id}" style="margin-left:${level * 25}px">

        <p class="meta">
          ${escapeHtml(c.author || 'anonim')}
          • ${new Date(c.created_at).toLocaleString()}
        </p>

        <div class="body">${nl2br(escapeHtml(c.body))}</div>

        <div class="comment-actions">
          <button class="reply-btn" data-comment-id="${c.id}">Odpowiedz</button>
        </div>

        <div class="replies">
          ${renderCommentsHtml(c.replies, level + 1)}
        </div>

      </div>
    `
    )
    .join('');
}

function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function nl2br(s = '') {
  return s.replace(/\n/g, '<br>');
}

loadArticles();
