const KEY = "aolt-notes-md";

function loadNotes() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

function saveNotes(text) {
  localStorage.setItem(KEY, text);
}

function simpleMarkdownToHtml(md) {
  let html = md;
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");
  html = html.replace(/\n$/gim, "<br />");
  return html;
}

export function initNotes() {
  const section = document.getElementById("notes");
  if (!section) return;
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Catatan Markdown</div>
          <div class="card-subtitle">Tulis catatan dengan format Markdown sederhana dan lihat hasilnya secara langsung.</div>
        </div>
      </div>
      <div class="grid-2 mt-md">
        <textarea id="md-editor" class="textarea" rows="14" placeholder="# Catatan hari ini...
- Gunakan **tebal** untuk poin penting
- Gunakan *miring* untuk penekanan
- Gunakan `+` `-` untuk bullet list"></textarea>
        <div id="md-preview" class="card" style="min-height:200px; overflow:auto;"></div>
      </div>
    </div>
  `;

  const editor = document.getElementById("md-editor");
  const preview = document.getElementById("md-preview");
  if (!editor || !preview) return;
  editor.value = loadNotes();

  function render() {
    const value = editor.value;
    saveNotes(value);
    preview.innerHTML = simpleMarkdownToHtml(value);
  }

  editor.addEventListener("input", render);
  render();
}
