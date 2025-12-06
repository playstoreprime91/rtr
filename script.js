// --------------------------------------
// LISTA ARTYKUŁÓW
// --------------------------------------
async function loadArticles() {
  const list = document.getElementById("articlesList");
  if (!list) return;

  const { data, error } = await supabase.from("articles").select("*").order("id", { ascending: false });

  if (error) {
    list.innerHTML = "<p>Błąd podczas ładowania artykułów</p>";
    return;
  }

  list.innerHTML = "";

  data.forEach(a => {
    const div = document.createElement("div");
    div.className = "article-card";
    div.innerHTML = `
      <h3>${a.title}</h3>
      <p>${a.content.substring(0, 150)}...</p>
      <a class="link" href="article.html?id=${a.id}">Czytaj więcej</a>
    `;
    list.appendChild(div);
  });
}

async function addArticle() {
  const btn = document.getElementById("addArticleBtn");
  if (!btn) return;

  btn.onclick = async () => {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    await supabase.from("articles").insert([{ title, content }]);

    location.reload();
  };
}

// --------------------------------------
// POJEDYNCZY ARTYKUŁ
// --------------------------------------
async function loadArticle() {
  const card = document.getElementById("articleCard");
  if (!card) return;

  const id = new URLSearchParams(location.search).get("id");

  const { data } = await supabase.from("articles").select("*").eq("id", id).single();

  document.getElementById("pageTitle").textContent = data.title;

  card.innerHTML = `
    <h2>${data.title}</h2>
    <p>${data.content}</p>
  `;
}

// --------------------------------------
// KOMENTARZE
// --------------------------------------
async function loadComments() {
  const wrap = document.getElementById("comments");
  if (!wrap) return;

  const id = new URLSearchParams(location.search).get("id");

  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("article_id", id)
    .order("id", { ascending: false });

  wrap.innerHTML = "";

  data.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<b>${c.author}</b><br>${c.content}`;
    wrap.appendChild(div);
  });
}

async function addComment() {
  const btn = document.getElementById("addCommentBtn");
  if (!btn) return;

  btn.onclick = async () => {
    const id = new URLSearchParams(location.search).get("id");
    const author = document.getElementById("c_author").value;
    const content = document.getElementById("c_content").value;

    await supabase.from("comments").insert([
      { article_id: id, author, content }
    ]);

    location.reload();
  };
}

// --------------------------------------
// AUTOMATYCZNE URUCHAMIANIE
// --------------------------------------
loadArticles();
addArticle();

loadArticle();
loadComments();
addComment();
