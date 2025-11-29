import { showToast } from "../app.js";

const KEY = "aolt-notes-md";
const NOTES_LIST_KEY = "aolt-notes-list";

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

function loadNotesList() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_LIST_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotesList(list) {
  localStorage.setItem(NOTES_LIST_KEY, JSON.stringify(list));
}

function simpleMarkdownToHtml(md) {
  let html = md;
  
  // Headers
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  
  // Bold and Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, "<code>$1</code>");
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, "<pre><code>$2</code></pre>");
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, "<a href='$2' target='_blank'>$1</a>");
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, "<img src='$2' alt='$1' />");
  
  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/^\+ (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gim, "<ul>$1</ul>");
  
  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>");
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");
  
  // Horizontal rule
  html = html.replace(/^---$/gim, "<hr>");
  html = html.replace(/^\*\*\*$/gim, "<hr>");
  
  // Line breaks
  html = html.replace(/\n$/gim, "<br />");
  
  return html;
}

export function initNotes() {
  const section = document.getElementById("notes");
  if (!section) return;
  
  let notesList = loadNotesList();
  let currentNoteIndex = 0;
  let wordCount = 0;
  let charCount = 0;
  let lineCount = 0;
  
  section.innerHTML = `
    <div class="notes-container">
      <!-- Header -->
      <div class="notes-header">
        <div class="notes-header-content">
          <div class="notes-header-left">
            <div class="notes-icon">📝</div>
            <div>
              <div class="notes-header-title">Markdown Editor</div>
              <div class="notes-header-subtitle">Tulis dan format catatan dengan mudah</div>
            </div>
          </div>
          <div class="notes-stats">
            <div class="notes-stat-item">
              <span class="notes-stat-icon">📄</span>
              <span class="notes-stat-value" id="notes-count">${notesList.length}</span>
            </div>
            <div class="notes-stat-item">
              <span class="notes-stat-icon">📊</span>
              <span class="notes-stat-value" id="word-count">0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="notes-toolbar">
        <div class="notes-toolbar-group">
          <button class="notes-toolbar-btn" data-action="bold" title="Bold (Ctrl+B)">
            <span class="notes-toolbar-icon">𝐁</span>
          </button>
          <button class="notes-toolbar-btn" data-action="italic" title="Italic (Ctrl+I)">
            <span class="notes-toolbar-icon" style="font-style: italic;">I</span>
          </button>
          <button class="notes-toolbar-btn" data-action="code" title="Inline Code">
            <span class="notes-toolbar-icon">&lt;/&gt;</span>
          </button>
        </div>
        <div class="notes-toolbar-divider"></div>
        <div class="notes-toolbar-group">
          <button class="notes-toolbar-btn" data-action="h1" title="Heading 1">
            <span class="notes-toolbar-icon">H1</span>
          </button>
          <button class="notes-toolbar-btn" data-action="h2" title="Heading 2">
            <span class="notes-toolbar-icon">H2</span>
          </button>
          <button class="notes-toolbar-btn" data-action="h3" title="Heading 3">
            <span class="notes-toolbar-icon">H3</span>
          </button>
        </div>
        <div class="notes-toolbar-divider"></div>
        <div class="notes-toolbar-group">
          <button class="notes-toolbar-btn" data-action="ul" title="Bullet List">
            <span class="notes-toolbar-icon">≡</span>
          </button>
          <button class="notes-toolbar-btn" data-action="ol" title="Numbered List">
            <span class="notes-toolbar-icon">1.</span>
          </button>
          <button class="notes-toolbar-btn" data-action="quote" title="Quote">
            <span class="notes-toolbar-icon">"</span>
          </button>
          <button class="notes-toolbar-btn" data-action="link" title="Link">
            <span class="notes-toolbar-icon">🔗</span>
          </button>
        </div>
        <div class="notes-toolbar-divider"></div>
        <div class="notes-toolbar-group">
          <button class="notes-toolbar-btn" data-action="save" title="Save Note">
            <span class="notes-toolbar-icon">💾</span>
          </button>
          <button class="notes-toolbar-btn" data-action="new" title="New Note">
            <span class="notes-toolbar-icon">📄</span>
          </button>
          <button class="notes-toolbar-btn" data-action="export" title="Export as Text">
            <span class="notes-toolbar-icon">⬇️</span>
          </button>
          <button class="notes-toolbar-btn" data-action="clear" title="Clear Editor">
            <span class="notes-toolbar-icon">🗑️</span>
          </button>
        </div>
      </div>

      <!-- Editor and Preview -->
      <div class="notes-workspace">
        <div class="notes-editor-panel">
          <div class="notes-panel-header">
            <span class="notes-panel-icon">✍️</span>
            <span class="notes-panel-title">Editor</span>
            <button class="notes-view-toggle" id="toggle-preview">
              <span>👁️</span> Preview
            </button>
          </div>
          <textarea 
            id="md-editor" 
            class="notes-textarea" 
            placeholder="# Judul Catatan

Mulai menulis catatan Anda di sini...

## Tips Markdown:
- **Tebal**: **text** atau __text__
- *Miring*: *text* atau _text_
- Code: \`code\`
- Link: [text](url)
- List: - item atau * item
- Heading: # H1, ## H2, ### H3

> Quote: Gunakan > di awal baris

---

Selamat menulis! 🎉"></textarea>
          <div class="notes-footer">
            <div class="notes-stats-bar">
              <span class="notes-stat-detail">📝 <span id="char-count">0</span> karakter</span>
              <span class="notes-stat-detail">📄 <span id="line-count">0</span> baris</span>
              <span class="notes-stat-detail">⏱️ Terakhir disimpan: <span id="last-saved">Belum disimpan</span></span>
            </div>
          </div>
        </div>

        <div class="notes-preview-panel" id="preview-panel">
          <div class="notes-panel-header">
            <span class="notes-panel-icon">👁️</span>
            <span class="notes-panel-title">Preview</span>
            <button class="notes-close-preview" id="close-preview">✕</button>
          </div>
          <div id="md-preview" class="notes-preview-content"></div>
        </div>
      </div>

      <!-- Saved Notes Sidebar -->
      <div class="notes-sidebar" id="notes-sidebar">
        <div class="notes-sidebar-header">
          <div>
            <div class="notes-sidebar-title">💾 Catatan Tersimpan</div>
            <div class="notes-sidebar-subtitle">${notesList.length} catatan</div>
          </div>
          <button class="notes-sidebar-close" id="close-sidebar">✕</button>
        </div>
        <div class="notes-list" id="notes-list"></div>
      </div>

      <!-- Toggle Sidebar Button -->
      <button class="notes-sidebar-toggle" id="toggle-sidebar" title="Saved Notes">
        <span>📂</span>
        <span class="notes-sidebar-badge">${notesList.length}</span>
      </button>
      
      <!-- Overlay -->
      <div class="notes-overlay" id="notes-overlay"></div>
    </div>
  `;

  const editor = document.getElementById("md-editor");
  const preview = document.getElementById("md-preview");
  const wordCountEl = document.getElementById("word-count");
  const charCountEl = document.getElementById("char-count");
  const lineCountEl = document.getElementById("line-count");
  const lastSavedEl = document.getElementById("last-saved");
  const notesCountEl = document.getElementById("notes-count");
  const previewPanel = document.getElementById("preview-panel");
  const togglePreviewBtn = document.getElementById("toggle-preview");
  const closePreviewBtn = document.getElementById("close-preview");
  const sidebar = document.getElementById("notes-sidebar");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar");
  const notesListEl = document.getElementById("notes-list");
  const overlay = document.getElementById("notes-overlay");

  if (!editor || !preview) return;
  
  editor.value = loadNotes();

  function updateStats() {
    const text = editor.value;
    charCount = text.length;
    wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    lineCount = text.split('\n').length;
    
    wordCountEl.textContent = wordCount;
    charCountEl.textContent = charCount;
    lineCountEl.textContent = lineCount;
  }

  function render() {
    const value = editor.value;
    saveNotes(value);
    preview.innerHTML = simpleMarkdownToHtml(value) || "<p style='color: var(--text-secondary); text-align: center; padding: 2rem;'>Preview akan muncul di sini...</p>";
    updateStats();
    
    const now = new Date();
    lastSavedEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function insertMarkdown(before, after = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    editor.value = newText;
    editor.focus();
    editor.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    render();
  }

  function insertLine(prefix) {
    const start = editor.selectionStart;
    const text = editor.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    editor.value = newText;
    editor.focus();
    editor.setSelectionRange(start + prefix.length, start + prefix.length);
    render();
  }

  function saveCurrentNote() {
    const content = editor.value.trim();
    if (!content) {
      showToast("❌ Catatan kosong", "error");
      return;
    }
    
    const title = content.split('\n')[0].replace(/^#+ /, '').substring(0, 50) || 'Catatan tanpa judul';
    const preview = content.substring(0, 100);
    const timestamp = Date.now();
    
    notesList.unshift({
      id: timestamp,
      title,
      preview,
      content,
      created: timestamp
    });
    
    saveNotesList(notesList);
    renderNotesList();
    notesCountEl.textContent = notesList.length;
    document.querySelector('.notes-sidebar-badge').textContent = notesList.length;
    document.querySelector('.notes-sidebar-subtitle').textContent = `${notesList.length} catatan`;
    showToast("💾 Catatan berhasil disimpan!");
  }

  function renderNotesList() {
    if (notesList.length === 0) {
      notesListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📝</div>
          <div style="font-size: 0.9rem;">Belum ada catatan tersimpan</div>
        </div>
      `;
      return;
    }
    
    notesListEl.innerHTML = notesList.map((note, index) => `
      <div class="notes-list-item" data-index="${index}">
        <div class="notes-list-item-content">
          <div class="notes-list-item-title">${note.title}</div>
          <div class="notes-list-item-preview">${note.preview}</div>
          <div class="notes-list-item-date">${new Date(note.created).toLocaleDateString('id-ID')}</div>
        </div>
        <button class="notes-list-item-delete" data-index="${index}" title="Hapus">🗑️</button>
      </div>
    `).join('');
  }

  function exportAsText() {
    const content = editor.value;
    if (!content.trim()) {
      showToast("❌ Tidak ada konten untuk diekspor", "error");
      return;
    }
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catatan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("⬇️ File berhasil diunduh!");
  }

  // Event Listeners
  editor.addEventListener("input", render);
  
  // Keyboard shortcuts
  editor.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**');
    } else if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*');
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveCurrentNote();
    }
  });

  // Toolbar actions
  section.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    
    const action = btn.dataset.action;
    
    switch(action) {
      case 'bold':
        insertMarkdown('**', '**');
        break;
      case 'italic':
        insertMarkdown('*', '*');
        break;
      case 'code':
        insertMarkdown('`', '`');
        break;
      case 'h1':
        insertLine('# ');
        break;
      case 'h2':
        insertLine('## ');
        break;
      case 'h3':
        insertLine('### ');
        break;
      case 'ul':
        insertLine('- ');
        break;
      case 'ol':
        insertLine('1. ');
        break;
      case 'quote':
        insertLine('> ');
        break;
      case 'link':
        insertMarkdown('[', '](url)');
        break;
      case 'save':
        saveCurrentNote();
        break;
      case 'new':
        if (confirm('Buat catatan baru? Catatan saat ini akan dikosongkan.')) {
          editor.value = '';
          render();
          showToast("📄 Catatan baru dibuat!");
        }
        break;
      case 'export':
        exportAsText();
        break;
      case 'clear':
        if (confirm('Hapus semua teks di editor?')) {
          editor.value = '';
          render();
          showToast("🗑️ Editor dikosongkan");
        }
        break;
    }
  });

  // Preview toggle
  togglePreviewBtn.addEventListener('click', () => {
    previewPanel.classList.add('active');
    overlay.classList.add('active');
  });
  
  closePreviewBtn.addEventListener('click', () => {
    previewPanel.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Sidebar toggle
  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    renderNotesList();
  });
  
  closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
  
  // Close on overlay click
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    previewPanel.classList.remove('active');
    overlay.classList.remove('active');
  });

  // Notes list interactions
  notesListEl.addEventListener('click', (e) => {
    const item = e.target.closest('.notes-list-item');
    const deleteBtn = e.target.closest('.notes-list-item-delete');
    
    if (deleteBtn) {
      e.stopPropagation();
      const index = parseInt(deleteBtn.dataset.index);
      if (confirm('Hapus catatan ini?')) {
        notesList.splice(index, 1);
        saveNotesList(notesList);
        renderNotesList();
        notesCountEl.textContent = notesList.length;
        document.querySelector('.notes-sidebar-badge').textContent = notesList.length;
        document.querySelector('.notes-sidebar-subtitle').textContent = `${notesList.length} catatan`;
        showToast("🗑️ Catatan dihapus");
      }
      return;
    }
    
    if (item) {
      const index = parseInt(item.dataset.index);
      const note = notesList[index];
      editor.value = note.content;
      render();
      sidebar.classList.remove('active');
      showToast(`📖 Membuka: ${note.title}`);
    }
  });

  render();
  renderNotesList();
}
