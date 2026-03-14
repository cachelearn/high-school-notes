let currentSubject = null;
let chapters = [];
let currentIdx = -1;
let katexReady = false;

const subjectLabels = { maths: 'Mathematics', physics: 'Physics', chemistry: 'Chemistry' };


function initKatex() { katexReady = true; }

function renderMath() {
  if (!katexReady) { setTimeout(renderMath, 100); return; }
  renderMathInElement(document.getElementById('content'), {
    delimiters: [
      { left: '$$', right: '$$', display: true  },
      { left: '$',  right: '$',  display: false }
    ],
    throwOnError: false
  });
}


function goHome() {
  currentSubject = null;
  chapters = [];
  currentIdx = -1;
  document.getElementById('home').classList.remove('hidden');
  document.getElementById('content').classList.add('hidden');
  document.getElementById('chapter-nav').classList.add('hidden');
  document.getElementById('sidebar').classList.add('collapsed');
  document.getElementById('chapter-list').innerHTML = '';
  document.getElementById('sidebar-subject').textContent = '';
  document.getElementById('breadcrumb').innerHTML = '';
}

async function loadSubject(subject) {
  currentSubject = subject;
  const res = await fetch(`content/${subject}/index.json`);
  chapters = await res.json();

  
  document.getElementById('sidebar-subject').textContent = subjectLabels[subject];
  const list = document.getElementById('chapter-list');
  list.innerHTML = '';
  chapters.forEach((ch, i) => {
    const li = document.createElement('li');
    li.textContent = ch.title;
    li.onclick = () => loadChapter(i);
    list.appendChild(li);
  });

  document.getElementById('sidebar').classList.remove('collapsed');
  document.getElementById('home').classList.add('hidden');

  
  if (chapters.length > 0) loadChapter(0);
}

async function loadChapter(idx) {
  currentIdx = idx;
  const ch = chapters[idx];

  
  document.querySelectorAll('#chapter-list li').forEach((li, i) => {
    li.classList.toggle('active', i === idx);
  });

  
  document.getElementById('breadcrumb').innerHTML =
    `<span>${subjectLabels[currentSubject]}</span> &rsaquo; <span class="crumb-active">${ch.title}</span>`;

  
  const res = await fetch(`content/${currentSubject}/${ch.file}`);
  const html = await res.text();
  const contentEl = document.getElementById('content');
  contentEl.innerHTML = html;
  contentEl.classList.remove('hidden');

  
  renderMath();

  
  const nav = document.getElementById('chapter-nav');
  nav.classList.remove('hidden');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  btnPrev.disabled = idx === 0;
  btnNext.disabled = idx === chapters.length - 1;

  
  window.scrollTo({ top: 0 });
}

function navigateChapter(dir) {
  const next = currentIdx + dir;
  if (next >= 0 && next < chapters.length) loadChapter(next);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}