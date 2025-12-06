const feed = document.getElementById('feed');
const articleForm = document.getElementById('article-form');
const articleDetail = document.getElementById('article-detail');
const detailDiv = document.getElementById('detail');
const backBtn = document.getElementById('back-btn');

backBtn.addEventListener('click', ()=>{
  articleDetail.classList.add('hidden');
  feed.parentElement.querySelector('.new-post').classList.remove('hidden');
  feed.classList.remove('hidden');
  loadFeed();
});

// Dodawanie artykułu
articleForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const content = document.getElementById('article-content').value.trim();
  const author = document.getElementById('article-author').value.trim() || "Anonim";
  if(!content) return;

  await window.supabase.from('articles').insert([{content, author}]);
  document.getElementById('article-content').value='';
  document.getElementById('article-author').value='';
  loadFeed();
});

// Ładowanie feedu
async function loadFeed(){
  feed.innerHTML='Ładowanie...';
  const {data, error} = await window.supabase
    .from('articles')
    .select('*')
    .order('created_at',{ascending:false});

  if(error){ feed.innerHTML='Błąd ładowania'; return; }
  if(!data || data.length===0){ feed.innerHTML='Brak postów'; return; }

  feed.innerHTML='';
  data.forEach(post=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <h3>${escapeHtml(post.author)}</h3>
      <p class="meta">${new Date(post.created_at).toLocaleString()}</p>
      <p>${escapeHtml(post.content)}</p>
      <button class="view-btn" data-id="${post.id}">Komentarze</button>
    `;
    feed.appendChild(card);
  });

  document.querySelectorAll('.view-btn').forEach(btn=>{
    btn.addEventListener('click', e=>showPost(e.target.dataset.id));
  });
}

// Pokazanie szczegółów postu z komentarzami
async function showPost(id){
  feed.classList.add('hidden');
  feed.parentElement.querySelector('.new-post').classList.add('hidden');
  articleDetail.classList.remove('hidden');

  const {data:post} = await window.supabase.from('articles').select('*').eq('id',id).single();
  const {data:comments} = await window.supabase.from('comments').select('*').eq('article_id',id).order('created_at',{ascending:true});

  // proste drzewko komentarzy
  const byId={};
  (comments||[]).forEach(c=>byId[c.id]={...c,replies:[]});
  const topLevel=[];
  (comments||[]).forEach(c=>{
    if(c.parent_id) byId[c.parent_id]?.replies.push(byId[c.id]);
    else topLevel.push(byId[c.id]);
  });

  detailDiv.innerHTML=`
    <div class="card">
      <h3>${escapeHtml(post.author)}</h3>
      <p class="meta">${new Date(post.created_at).toLocaleString()}</p>
      <p>${escapeHtml(post.content)}</p>
    </div>
    <div id="comments-section">
      <h4>Komentarze</h4>
      <form id="comment-form">
        <input id="comment-author" placeholder="Twoje imię"/>
        <textarea id="comment-body" placeholder="Napisz komentarz" required></textarea>
        <button type="submit">Dodaj komentarz</button>
      </form>
      <div id="comments-list">${renderComments(topLevel)}</div>
    </div>
  `;

  document.getElementById('comment-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const body = document.getElementById('comment-body').value.trim();
    const author = document.getElementById('comment-author').value.trim() || 'Anonim';
    if(!body) return;
    await window.supabase.from('comments').insert([{article_id:id, body, author}]);
    showPost(id);
  });

  document.querySelectorAll('.reply-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const parentId=e.target.dataset.id;
      openReplyForm(parentId,id);
    });
  });
}

// render komentarzy
function renderComments(comments){
  if(!comments || comments.length===0) return '<p>Brak komentarzy</p>';
  return comments.map(c=>`
    <div class="comment" id="comment-${c.id}">
      <strong>${escapeHtml(c.author)}</strong> • ${new Date(c.created_at).toLocaleString()}
      <p>${escapeHtml(c.body)}</p>
      <button class="reply-btn" data-id="${c.id}">Odpowiedz</button>
      <div class="replies">${renderComments(c.replies)}</div>
    </div>
  `).join('');
}

// formularz odpowiedzi
function openReplyForm(parentId,articleId){
  const parentEl=document.getElementById(`comment-${parentId}`);
  if(parentEl.querySelector('.reply-form')) return;
  const form=document.createElement('form');
  form.className='reply-form';
  form.innerHTML=`
    <input name="author" placeholder="Twoje imię"/>
    <textarea name="body" placeholder="Napisz odpowiedź" required></textarea>
    <button type="submit">Wyślij</button>
    <button type="button" class="cancel">Anuluj</button>
  `;
  parentEl.appendChild(form);

  form.querySelector('.cancel').addEventListener('click',()=>form.remove());

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const author=form.querySelector('input[name="author"]').value.trim()||'Anonim';
    const body=form.querySelector('textarea[name="body"]').value.trim();
    if(!body) return;
    await window.supabase.from('comments').insert([{article_id:articleId,parent_id:parentId,author,body}]);
    showPost(articleId);
  });
}

// helper
function escapeHtml(s=''){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

loadFeed();
