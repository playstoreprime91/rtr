const tableName = "books";

let editId = null;

// ---------------- LOAD BOOKS ----------------
async function loadBooks() {
  const { data, error } = await window.supabase
    .from(tableName)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    alert("Błąd ładowania: " + error.message);
    return;
  }

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.published_date}</td>
      <td>${b.pages}</td>
      <td>${b.genre ?? ""}</td>
      <td>${b.rating ?? ""}</td>
      <td>
        <button onclick="editBook(${b.id}, '${b.title}', '${b.author}', '${b.published_date}', '${b.pages}', '${b.genre ?? ""}', '${b.rating ?? ""}')">Edytuj</button>
        <button class="danger" onclick="deleteBook(${b.id})">Usuń</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------------- ADD / UPDATE ----------------
document.getElementById("bookForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    title: title.value.trim(),
    author: author.value.trim(),
    published_date: published_date.value,
    pages: Number(pages.value),
    genre: genre.value.trim(),
    rating: rating.value ? Number(rating.value) : null,
  };

  if (!editId) {
    // INSERT
    const { error } = await window.supabase.from(tableName).insert([payload]);
    if (error) return alert("Błąd dodawania: " + error.message);
  } else {
    // UPDATE
    const { error } = await window.supabase
      .from(tableName)
      .update(payload)
      .eq("id", editId);
    if (error) return alert("Błąd edycji: " + error.message);

    editId = null;
    saveBtn.textContent = "Dodaj";
    cancelBtn.style.display = "none";
  }

  e.target.reset();
  loadBooks();
});

// ---------------- EDIT MODE ----------------
function editBook(id, t, a, d, p, g, r) {
  editId = id;

  title.value = t;
  author.value = a;
  published_date.value = d;
  pages.value = p;
  genre.value = g;
  rating.value = r;

  saveBtn.textContent = "Zapisz zmiany";
  cancelBtn.style.display = "inline-block";
}

cancelBtn.onclick = () => {
  editId = null;
  bookForm.reset();
  saveBtn.textContent = "Dodaj";
  cancelBtn.style.display = "none";
};

// ---------------- DELETE ----------------
async function deleteBook(id) {
  if (!confirm("Na pewno usunąć?")) return;

  const { error } = await window.supabase
    .from(tableName)
    .delete()
    .eq("id", id);

  if (error) alert("Błąd usuwania: " + error.message);

  loadBooks();
}

// ---------------- START ----------------
loadBooks();
