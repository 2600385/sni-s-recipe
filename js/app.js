(function () {
const db = window.SNIData;
const { SOURCES, POCKETS, FTYPES, TOOL_KINDS, NOTE_KINDS, NOTE_TABS } = db;

// 이름이 바뀌면 여기만 고친다
const NAME = { full: '스니의 업무 레시피', short: '업무 레시피', eyebrow: "SNI'S WORK RECIPE" };
document.title = NAME.full;

const app = document.getElementById('app');
const sheetRoot = document.getElementById('sheet-root');

const state = {
  items: [],
  secret: null, // 잠금 해제 전에는 null
  purpose: '',
  ftype: '',
  pq: '',
  secretView: false,
  picked: null,
  stirring: false,
  noteTab: 'all',
  noteSub: 'all',
  noteQ: '',
  secretPw: ''
};

// ---------- 공통 ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const STAR = 'M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z';
const LOCK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const EDIT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
const TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
const BACK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
const ICONS = {
  HTML: 'M4 4h16v16H4zM4 9h16M8 13l-2 2 2 2M16 13l2 2-2 2',
  URL: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  LINK: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  PDF: 'M7 3h7l5 5v13H7zM14 3v5h5M10 16h6M10 12h3',
  IMG: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M15.5 8.5h0',
  MENT: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  FILE: 'M7 3h7l5 5v13H7zM14 3v5h5',
  BD: 'M4 4h11l5 5v11H4zM15 4v5h5M7 13h10M7 16h6M7 9h5',
  PPT: 'M4 5h16v11H4zM12 16v4M8 20h8M8 12V9M12 12V7M16 12v-2',
  DOCX: 'M7 3h7l5 5v13H7zM14 3v5h5M9.5 12l1.2 5 1.3-4 1.3 4 1.2-5'
};
// 곰 셰프: 곰 얼굴 + 요리사 모자
const bear = (size, cls = '') => `<svg class="bear ${cls}" width="${size}" height="${Math.round(size * 1.1)}" viewBox="0 0 100 110" aria-hidden="true">
  <g stroke="#3D4450" stroke-width="4" stroke-linejoin="round">
    <circle cx="22" cy="58" r="13" fill="#D9A273"/><circle cx="78" cy="58" r="13" fill="#D9A273"/>
    <circle cx="22" cy="58" r="6" fill="#F3D6B8" stroke="none"/><circle cx="78" cy="58" r="6" fill="#F3D6B8" stroke="none"/>
    <ellipse cx="50" cy="74" rx="34" ry="31" fill="#D9A273"/>
    <path d="M24 44c-8-2-12-10-8-17 4-7 13-7 17-3 2-8 10-13 17-13s15 5 17 13c4-4 13-4 17 3 4 7 0 15-8 17z" fill="#FFFFFF"/>
    <rect x="25" y="40" width="50" height="12" rx="4" fill="#FFFFFF"/>
    <ellipse cx="50" cy="86" rx="15" ry="11" fill="#F3D6B8"/>
  </g>
  <circle cx="37" cy="70" r="4" fill="#0B2E45"/><circle cx="63" cy="70" r="4" fill="#0B2E45"/>
  <circle cx="38.5" cy="68.5" r="1.3" fill="#FFFFFF"/><circle cx="64.5" cy="68.5" r="1.3" fill="#FFFFFF"/>
  <ellipse cx="50" cy="81" rx="5" ry="3.6" fill="#0B2E45"/>
  <path d="M45 88q5 4 10 0" fill="none" stroke="#0B2E45" stroke-width="2.4" stroke-linecap="round"/>
  <ellipse cx="28" cy="80" rx="5" ry="3" fill="#FF9FB8" opacity=".7"/><ellipse cx="72" cy="80" rx="5" ry="3" fill="#FF9FB8" opacity=".7"/>
</svg>`;
const KIND_LABEL = { FILE: '파일', HTML: 'HTML', BD: 'BD', URL: 'URL', LINK: '링크', PDF: 'PDF', IMG: '이미지', MENT: '표준멘트', PPT: 'PPT', DOCX: 'DOCX' };
const icon = (kind, size, color) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[kind] || ICONS.URL}"/></svg>`;
const kindTag = (kind) => `<span class="kind k-${kind}">${KIND_LABEL[kind] || kind}</span>`;
const pocketLabel = (id) => (POCKETS.find((p) => p.id === id) || {}).label || id;
const noteMeta = (d) => {
  const t = NOTE_TABS[d.tab];
  return [t ? t.label : '', t && t.subs[d.sub] ? t.subs[d.sub] : '', d.date || '날짜 미정'].filter(Boolean).join(' · ');
};
const findItem = (id) => state.items.concat(state.secret || []).find((x) => x.id === id);
const manageBtns = (d) => `<button type="button" class="mini-btn" data-edit="${d.id}" aria-label="${esc(d.title)} 고치기">${EDIT}</button><button type="button" class="mini-btn del" data-del="${d.id}" aria-label="${esc(d.title)} 지우기">${TRASH}</button>`;
const isFileKind = (k) => k === 'FILE' || k === 'PDF' || k === 'IMG' || k === 'PPT' || k === 'DOCX' || k === 'BD';

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

async function reload() {
  state.items = await db.listItems();
}

// ---------- 라우팅 ----------
// 나만 쓰는 공간이라 시크릿 서랍은 화면에서 뺐다 (창고 기능은 남아 있음)
const routes = { enter: renderEnter, home: renderHome, pocket: renderPocket, notes: renderNotes };

async function route() {
  const name = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
  const authed = await db.getSession();
  if (!authed && name !== 'enter') return go('enter');
  if (authed && name === 'enter') return go('home');
  document.body.classList.toggle('is-pocket', name === 'pocket');
  (routes[name] || renderHome)();
  window.scrollTo(0, 0);
}
function go(name) {
  if (location.hash === '#/' + name) route();
  else location.hash = '#/' + name;
}
window.addEventListener('hashchange', route);

function topbar(back) {
  return `<header class="topbar">
    ${back ? `<a class="pill-btn" href="#/home">${BACK}${NAME.short}로</a>` : `<div class="brand">${bear(30)}${NAME.full}</div>`}
    ${back ? `<span class="brand">${bear(26)}${NAME.full}</span>` : `<button type="button" class="pill-btn" data-act="signout">${LOCK}레시피 덮기</button>`}
  </header>`;
}

// ---------- 입장 ----------
function renderEnter() {
  app.innerHTML = `<section class="enter">
    <svg class="wand" aria-hidden="true" width="70" height="120" viewBox="0 0 120 220"><rect x="53" y="62" width="14" height="150" rx="7" fill="#FFFFFF" stroke="#3D4450" stroke-width="5"/><path d="M55 92l10-10M55 122l10-10M55 152l10-10M55 182l10-10" stroke="#8FD3F7" stroke-width="5" stroke-linecap="round"/><path d="M60 2l14 30 33 5-24 23 6 33-29-16-29 16 6-33-24-23 33-5z" fill="#FFC94D" stroke="#3D4450" stroke-width="5" stroke-linejoin="round"/></svg>
    <div>
      <div class="eyebrow">${NAME.eyebrow}</div>
      <h1 class="sticker-title">${NAME.full}</h1>
    </div>
    <form class="enter-card" id="enter-form" novalidate>
      ${bear(64, 'peek')}
      <label for="recipe-code">비밀 레시피를 넣어주세요</label>
      <input id="recipe-code" class="code-input" type="password" inputmode="numeric" autocomplete="current-password" required>
      <button type="submit" class="primary-btn">레시피 열기</button>
      <div class="error" id="enter-err" role="alert" hidden></div>
      <div class="hint">${db.isDemo ? (window.SNI_CONFIG && !window.SNI_CONFIG.demo ? '창고 연결 도구를 불러오지 못해 예시 모드로 열렸어요. 회사망에서 막혔을 수 있어요.' : '지금은 예시 모드라 아무 글자나 넣어도 열려요.') : '스니 전용 주방이에요. 오늘도 수고했어요!'}</div>
    </form>
  </section>`;
  const form = document.getElementById('enter-form');
  const input = document.getElementById('recipe-code');
  const err = document.getElementById('enter-err');
  input.focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    err.hidden = true;
    try {
      await db.signIn(input.value.trim());
      await reload();
      go('home');
    } catch (ex) {
      err.textContent = ex.message || '레시피가 맞지 않아요.';
      err.hidden = false;
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      input.select();
    } finally {
      btn.disabled = false;
    }
  });
}

// ---------- 홈 ----------
function renderHome() {
  const tools = state.items.filter((d) => d.section === 'tool');
  const notes = state.items.filter((d) => d.section === 'note');
  const mine = tools.filter((d) => d.mine).length;
  const nReport = notes.filter((d) => d.tab === 'report').length;
  const nPres = notes.filter((d) => d.tab === 'pres').length;
  app.innerHTML = `<div class="wrap">
    ${topbar(false)}
    <section class="home-hero rise">
      <h2>오늘은 어떤 걸 꺼내볼까요?</h2>
      <p>재료는 툴 주머니에, 내가 쓴 기록은 레시피 노트에 담겨 있어요.</p>
    </section>
    <section class="pockets">
      <a href="#/pocket" class="pocket rise r2">
        <div class="top"><span class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3E79B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg></span><span class="tag">재료</span></div>
        <div class="name">툴 주머니</div>
        <p>업무 툴 · 자료 모음집</p>
        <div class="bot"><div class="counts"><span>전체 ${tools.length}</span><span>스니's ${mine}</span></div><span class="go">열기 →</span></div>
      </a>
      <a href="#/notes" class="pocket notes rise r3">
        <div class="top"><span class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B0477A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM4 17a2 2 0 0 1 2-2h12"/></svg></span><span class="tag">기록</span>
          <span class="lockkey" title="나만 보는 기록"><svg width="40" height="30" viewBox="0 0 40 30" fill="none" stroke="#B0477A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="13" width="16" height="13" rx="3" fill="#FFE6F0"/><path d="M7 13V9a4 4 0 0 1 8 0v4"/><circle cx="11" cy="19.5" r="1.6" fill="#B0477A" stroke="none"/><circle cx="29" cy="10" r="4.5" fill="#FFF3D6" stroke="#C9871E"/><path d="M29 14.5V26M29 21h3.5M29 24.5h2.5" stroke="#C9871E"/></svg></span></div>
        <div class="name">레시피 노트</div>
        <p>보고서 · 인수인계서 · 발표자료 등</p>
        <div class="bot"><div class="counts"><span>보고서 ${nReport}</span><span>발표용 ${nPres}</span></div><span class="go">펼치기 →</span></div>
      </a>
    </section>
  </div>`;
}

// ---------- 툴 주머니 ----------
const FLY = [[300, -50, 34], [180, 40, 0], [60, -25, 48], [-60, 30, 10], [-180, -40, 40], [-300, 55, 4], [120, -35, 30], [-120, 45, 8], [80, -40, 20], [-80, 40, 0]];

const matchPurpose = (d, p) => !p || (p === 'sni' ? !!d.mine : !d.mine);
const matchType = (d, f) => {
  if (!f || f === 'all') return true;
  if (f === 'URL') return d.kind === 'URL' || d.kind === 'HTML';
  if (f === 'PDF') return d.kind === 'PDF';
  return (d.pockets || []).includes(f);
};

// 지금 꺼낼 툴. null이면 아직 아무것도 안 고른 상태
function pocketList() {
  if (state.secretView) return state.secret ? state.secret.filter((d) => d.section === 'tool') : [];
  const tools = state.items.filter((d) => d.section === 'tool');
  const q = state.pq.trim().toLowerCase();
  if (q) return tools.filter((d) => (d.title + ' ' + (d.desc || '') + ' ' + (d.body || '')).toLowerCase().includes(q));
  if (!state.purpose && !state.ftype) return null;
  return tools.filter((d) => matchPurpose(d, state.purpose) && matchType(d, state.ftype));
}

function renderPocket() {
  app.innerHTML = `<div class="wrap pocket-screen">
    ${topbar(true)}
    <div class="pocket-title">
      <h1><span class="w1">Tool</span><span class="w2">주머니</span></h1>
      <p>오늘은 뭐가 필요해? 사탕을 고르면 주머니에서 딱 맞는 툴이 뾱! 튀어나와요.</p>
    </div>
    <div class="swirl-box" id="swirl">
      <div class="swirl-fx" id="swirl-fx" aria-hidden="true"></div>
      <div class="swirl-glow" aria-hidden="true"></div>
      <button type="button" class="swirl-btn" data-act="stir" aria-label="요술봉으로 저어서 다시 꺼내기">
        <span aria-hidden="true">
          <span class="sw-halo"></span><span class="sw-1"></span><span class="sw-2"></span><span class="sw-3"></span><span class="sw-core"></span><span class="sw-rim"></span>
          <span class="sw-orbit">
            <svg width="30" height="30" viewBox="0 0 24 24" style="left:50%;top:0"><path d="${STAR}" fill="#FFE27A"/></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" style="left:4%;top:62%"><path d="${STAR}" fill="#FFFFFF"/></svg>
            <svg width="26" height="26" viewBox="0 0 24 24" style="right:6%;top:66%"><path d="${STAR}" fill="#FF9F45"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" style="left:22%;top:12%"><path d="${STAR}" fill="#FFFFFF"/></svg>
          </span>
        </span>
      </button>
      <div class="wand-x" aria-hidden="true"><div class="wand-y">
        <svg viewBox="0 0 120 232" style="display:block;width:100%;overflow:visible"><rect x="53" y="6" width="14" height="150" rx="7" fill="#FFFFFF" stroke="#3D4450" stroke-width="4"/><path d="M55 36l10-10M55 66l10-10M55 96l10-10M55 126l10-10" stroke="#8FD3F7" stroke-width="5" stroke-linecap="round"/><g transform="translate(0,134)"><path d="M60 2l14 30 33 5-24 23 6 33-29-16-29 16 6-33-24-23 33-5z" fill="#FFC94D" stroke="#3D4450" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="42" r="5" fill="#FFFFFF" opacity=".9"/></g></svg>
      </div></div>
      <div class="swirl-cap">요술봉이 휘휘 젓는 중. 누르면 다시 뾱!</div>
    </div>
    <div class="pocket-tools">
      <div class="prow">
        <div class="crow"><span class="clabel">어디 자료?</span><div class="candies" id="balls"></div></div>
        <div class="search">
          <label for="pq" class="sr-only">툴 검색</label>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D4450" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
          <input id="pq" type="search" placeholder="툴 이름으로 찾기" value="${esc(state.pq)}">
        </div>
      </div>
      <div class="crow crow-scroll"><span class="clabel">어떤 걸 찾아?</span><div class="candies" id="candies"></div></div>
    </div>
    <div class="tiles" id="tiles"></div>
    <div class="detail" id="detail" aria-live="polite"></div>
    <button type="button" class="dash-btn" data-act="add" data-section="tool">＋ 주머니에 새 툴 넣기</button>
  </div>`;
  document.getElementById('pq').addEventListener('input', (e) => {
    state.pq = e.target.value;
    clearTimeout(renderPocket.t);
    renderPocket.t = setTimeout(() => stir({ secretView: false, picked: null }), 300);
  });
  paintCandies();
  paintTiles();
  paintDetail();
}

function paintCandies() {
  const tools = state.items.filter((d) => d.section === 'tool');
  const off = !!state.pq.trim() || state.secretView;
  const deco = {
    dw: '<span class="ears" aria-hidden="true"></span>',
    sni: '<svg class="crown" width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M2 12L1 3l5 4 5-6 5 6 5-4-1 9z" fill="#FFD66B" stroke="#C9871E" stroke-width="1.4" stroke-linejoin="round"/></svg>'
  };
  const candy = (id, label, n, on, cls, attr) => `<button type="button" class="candy ${cls}${on ? ' on' : ''}" aria-pressed="${on}" ${attr}="${id}"><span class="wr-l" aria-hidden="true"></span><span class="body">${deco[id] || ''}<span>${label}</span><span class="cnt">${n}</span></span><span class="wr-r" aria-hidden="true"></span></button>`;
  document.getElementById('balls').innerHTML = SOURCES.map((p) => candy(p.id, p.label,
    tools.filter((d) => matchPurpose(d, p.id) && matchType(d, state.ftype)).length,
    !off && p.id === state.purpose, 'src src-' + p.id, 'data-purpose')).join('');
  document.getElementById('candies').innerHTML = FTYPES.map((f, i) => candy(f.id, f.label,
    tools.filter((d) => matchPurpose(d, state.purpose) && matchType(d, f.id)).length,
    !off && f.id === state.ftype, 'c' + (i % 7 + 1), 'data-ftype')).join('');
}

function paintTiles() {
  const box = document.getElementById('tiles');
  if (!box) return;
  if (state.stirring) { box.innerHTML = ''; return; }
  const list = pocketList();
  if (!list) {
    box.innerHTML = '<div class="bubble">사탕을 고르거나 검색하면 요술봉이 툴을 꺼내줘요</div>';
    return;
  }
  if (state.secretView && !state.secret) {
    box.innerHTML = lockCard('pocket');
    bindLockCard();
    return;
  }
  let html = list.map((d, i) => {
    const f = FLY[i % FLY.length];
    return `<button type="button" class="tile${state.picked === d.id ? ' on' : ''}" data-pick="${d.id}" style="--dx:${f[0]}px;--r:${f[1]}deg;margin-top:${f[2]}px;animation-delay:${(i * 0.09).toFixed(2)}s"><span style="animation-duration:${(3.1 + (i % 5) * 0.3).toFixed(1)}s">
      ${kindTag(d.kind)}${icon(d.kind, 44, '#4A5260')}<span class="nm">${esc(d.title)}</span></span></button>`;
  }).join('');
  if (!list.length) html = `<div class="bubble">${state.pq.trim() ? '찾는 툴이 없어요' : '이 조합에 맞는 툴이 아직 없어요'}</div>`;
  if (state.secretView) html += '<button type="button" class="relock" data-act="relock" style="flex-basis:100%;max-width:160px">다시 잠그기</button>';
  box.innerHTML = html;
  launchFromSwirl(box);
}

// 툴이 오로라 한가운데에서 출발해 제자리로 날아오게 출발점을 잡는다
function launchFromSwirl(box) {
  const sw = document.querySelector('.swirl-btn');
  if (!sw) return;
  const s = sw.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const cx = s.left + s.width / 2 - b.left;
  const cy = s.top + s.height / 2 - b.top;
  box.querySelectorAll('.tile').forEach((el) => {
    el.style.setProperty('--fx', Math.round(cx - (el.offsetLeft + el.offsetWidth / 2)) + 'px');
    el.style.setProperty('--fy', Math.round(cy - (el.offsetTop + el.offsetHeight / 2)) + 'px');
  });
}

function paintDetail() {
  const box = document.getElementById('detail');
  if (!box) return;
  const all = state.items.concat(state.secret || []);
  const d = all.find((x) => x.id === state.picked);
  if (!d) {
    box.innerHTML = '<div class="empty">튀어나온 툴을 누르면 설명과 바로가기가 여기에 나와요.</div>';
    return;
  }
  const meta = [KIND_LABEL[d.kind], d.mine ? "스니's Tool" : '', d.secret ? '시크릿' : ''].filter(Boolean).join(' · ');
  const tags = (d.pockets || []).map(pocketLabel).join(' · ');
  let action;
  if (d.kind === 'MENT') action = `<button type="button" class="go-btn" data-copy="${d.id}">멘트 복사</button>`;
  else if (d.url) action = `<a class="go-btn" href="${esc(d.url)}" target="_blank" rel="noopener">꺼내 쓰기</a>`;
  else action = '<span class="ghost-btn" aria-disabled="true">주소 준비 중</span>';
  box.innerHTML = `<div class="has">
    <div class="info">
      <div class="nm">${esc(d.title)}</div>
      ${d.desc ? `<div class="ds">${esc(d.desc)}</div>` : ''}
      <div class="meta">${meta}${tags ? ' · ' + tags : ''}</div>
    </div>
    <div class="acts">${action}${manageBtns(d)}</div>
    ${d.kind === 'MENT' && d.body ? `<div class="ment">${esc(d.body)}</div>` : ''}
  </div>`;
}

function stir(next) {
  Object.assign(state, next, { stirring: true });
  document.getElementById('swirl')?.classList.add('stirring');
  paintCandies();
  paintTiles();
  clearTimeout(stir.t);
  stir.t = setTimeout(() => {
    state.stirring = false;
    document.getElementById('swirl')?.classList.remove('stirring');
    const fx = document.getElementById('swirl-fx');
    if (fx && pocketList()) {
      fx.innerHTML = `<div class="pf" style="left:8%;top:-34px;--r:-14deg;font-size:40px;color:#E4572E;animation-delay:.1s">뾱!</div>
        <div class="pf" style="right:6%;top:-50px;--r:12deg;font-size:30px;color:#3D4450;animation-delay:.35s">뾰뿁!</div>
        <svg class="sp" width="26" height="26" viewBox="0 0 24 24" style="left:30%;--dx:-90px;--dy:-120px;animation-delay:.1s"><path d="${STAR}" fill="#FF9F45"/></svg>
        <svg class="sp" width="20" height="20" viewBox="0 0 24 24" style="left:48%;--dx:10px;--dy:-150px;animation-delay:.2s"><path d="${STAR}" fill="#FFFFFF"/></svg>
        <svg class="sp" width="28" height="28" viewBox="0 0 24 24" style="left:62%;--dx:100px;--dy:-110px;animation-delay:.3s"><path d="${STAR}" fill="#FF9F45"/></svg>`;
    }
    paintTiles();
    paintDetail();
  }, 560);
}

// ---------- 시크릿 잠금 ----------
function lockCard(where) {
  return `<form class="lock-card" data-lock="${where}" novalidate>
    <div class="t">${LOCK}시크릿 서랍</div>
    <div class="s">원장님 앞에서 화면을 띄울 때 보이면 안 되는 툴과 기록이 들어 있어요.</div>
    <label for="secret-pw-${where}">비밀번호</label>
    <input id="secret-pw-${where}" class="field-input masked" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="한글도 돼요">
    <div class="error" role="alert" hidden></div>
    <button type="submit" class="open-btn">열려라 참깨</button>
  </form>`;
}
function bindLockCard() {
  document.querySelectorAll('form[data-lock]').forEach((f) => {
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = f.querySelector('.error');
      try {
        state.secretPw = f.querySelector('input').value;
        state.secret = await db.unlockSecret(state.secretPw);
        if (f.dataset.lock === 'pocket') stir({});
        else renderSecret();
      } catch (ex) {
        err.textContent = ex.message || '비밀번호가 맞지 않아요.';
        err.hidden = false;
      }
    });
  });
}

// ---------- 레시피 노트 · 시크릿 서랍 목록 ----------
function docRow(d) {
  const meta = d.section === 'tool' ? ['툴 주머니', (d.pockets || []).map(pocketLabel).join(' · ')].filter(Boolean).join(' · ') : noteMeta(d);
  const open = d.kind === 'MENT'
    ? `<button type="button" class="open" data-copy="${d.id}" style="border:0">복사</button>`
    : d.url ? `<a class="open" href="${esc(d.url)}" target="_blank" rel="noopener">열기</a>` : '<span class="open disabled" aria-disabled="true">링크 준비 중</span>';
  const dl = isFileKind(d.kind) && d.url
    ? `<a class="dl" href="${esc(d.url)}" download aria-label="${esc(d.title)} 내려받기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E2E5C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></a>` : '';
  return `<div class="doc-row">
    <span class="ic">${icon(d.kind, 22, '#8E2E5C')}</span>
    <div class="info"><div class="tl"><b>${esc(d.title)}</b>${kindTag(d.kind)}</div><div class="mt">${esc(meta)}</div></div>
    <div class="acts">${open}${dl}${manageBtns(d)}</div>
  </div>`;
}

// 레시피 노트: 한 장씩 보이는 보고서 카드
function noteCard(d) {
  const t = NOTE_TABS[d.tab];
  const sub = t && t.subs[d.sub] ? t.subs[d.sub] : '';
  const open = d.url
    ? `<a class="nc-open" href="${esc(d.url)}" target="_blank" rel="noopener">열기</a>`
    : '<span class="nc-open disabled" aria-disabled="true">링크 준비 중</span>';
  return `<article class="nc-wrap"><div class="note-card t-${esc(d.tab || 'etc')}">
    <div class="nc-top"><span class="nc-tab">${t ? t.label : '기록'}</span>${kindTag(d.kind)}</div>
    <h3 class="nc-title">${esc(d.title)}</h3>
    <div class="nc-lines" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="nc-meta">${esc([sub, d.date || '날짜 미정'].filter(Boolean).join(' · '))}</div>
    <div class="nc-acts">${open}${manageBtns(d)}</div>
  </div></article>`;
}

// 카드가 책 한가운데에서 미니 책으로 튀어나와 제자리로 내려앉게 출발점을 잡는다
function launchFromBook(box) {
  const book = document.querySelector('.book');
  if (!book) return;
  const s = book.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const cx = s.left + s.width / 2 - b.left;
  const cy = s.top + s.height / 2 - b.top;
  box.querySelectorAll('.nc-wrap').forEach((el, i) => {
    el.style.setProperty('--fx', Math.round(cx - (el.offsetLeft + el.offsetWidth / 2)) + 'px');
    el.style.setProperty('--fy', Math.round(cy - (el.offsetTop + el.offsetHeight / 2)) + 'px');
    el.style.animationDelay = (0.35 + i * 0.08).toFixed(2) + 's';
    el.classList.add('pop');
  });
}

function renderNotes() {
  app.innerHTML = `<div class="wrap notes-screen">
    ${topbar(true)}
    <section class="notes-hero">
      <h1 class="notes-title">레시피 노트</h1>
      <p>내가 직접 쓴 보고서와 발표 자료를 모아둔 노트예요.</p>
      <div class="book-stage" id="book">
        <div class="book-aura" aria-hidden="true"></div>
        <div class="book-fx" id="book-fx" aria-hidden="true"></div>
        <button type="button" class="book-btn" data-act="flip" aria-label="요술봉으로 노트 다시 넘기기">
          <span class="book" aria-hidden="true">
            <span class="cover"></span>
            <span class="page pl"></span><span class="page pr"></span>
            <span class="flip fp1"></span><span class="flip fp2"></span><span class="flip fp3"></span>
            <span class="spine"></span>
          </span>
        </button>
        <div class="nwand-x" aria-hidden="true"><div class="nwand-y">
          <svg viewBox="0 0 120 232" style="display:block;width:100%;overflow:visible"><rect x="53" y="6" width="14" height="150" rx="7" fill="#FFFFFF" stroke="#3D4450" stroke-width="4"/><path d="M55 36l10-10M55 66l10-10M55 96l10-10M55 126l10-10" stroke="#F5A8C8" stroke-width="5" stroke-linecap="round"/><g transform="translate(0,134)"><path d="M60 2l14 30 33 5-24 23 6 33-29-16-29 16 6-33-24-23 33-5z" fill="#FFC94D" stroke="#3D4450" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="42" r="5" fill="#FFFFFF" opacity=".9"/></g></svg>
        </div></div>
        <div class="book-cap">요술봉이 휙휙 넘기는 중. 누르면 다시 촤라락!</div>
      </div>
    </section>
    <div class="notes-tools">
      <div class="big-tabs" id="big-tabs"></div>
      <div class="search">
        <label for="nq" class="sr-only">노트 검색</label>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E2E5C" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
        <input id="nq" type="search" placeholder="제목으로 찾기 (예: 인수인계, 월례)" value="${esc(state.noteQ)}">
      </div>
    </div>
    <div class="sub-tabs" id="sub-tabs"></div>
    <section style="display:flex;flex-direction:column;gap:10px">
      <div class="result-label" id="result-label"></div>
      <div class="note-grid" id="doc-list"></div>
    </section>
    <button type="button" class="notes-add" data-act="add" data-section="note">＋ 새 기록 넣기</button>
  </div>`;
  document.getElementById('nq').addEventListener('input', (e) => { state.noteQ = e.target.value; paintNotes(false); });
  flipBook();
}

// 요술봉이 오로라 책을 휙휙 넘기고, 기록이 책에서 뾰로롱 튀어나온다
function flipBook() {
  const stage = document.getElementById('book');
  if (!stage) return;
  stage.classList.remove('flipping');
  void stage.offsetWidth;
  stage.classList.add('flipping');
  document.getElementById('book-fx').innerHTML = `<div class="pf" style="left:4%;top:-30px;--r:-12deg;font-size:34px;color:#B0477A;animation-delay:.15s">촤라락!</div>
    <div class="pf" style="right:4%;top:-44px;--r:10deg;font-size:28px;color:#3D4450;animation-delay:.4s">뾰로롱!</div>
    <svg class="sp" width="24" height="24" viewBox="0 0 24 24" style="left:28%;--dx:-80px;--dy:-110px;animation-delay:.2s"><path d="${STAR}" fill="#FFB7D5"/></svg>
    <svg class="sp" width="18" height="18" viewBox="0 0 24 24" style="left:50%;--dx:0px;--dy:-140px;animation-delay:.3s"><path d="${STAR}" fill="#FFFFFF"/></svg>
    <svg class="sp" width="26" height="26" viewBox="0 0 24 24" style="left:66%;--dx:90px;--dy:-100px;animation-delay:.35s"><path d="${STAR}" fill="#FFE27A"/></svg>`;
  clearTimeout(flipBook.t);
  flipBook.t = setTimeout(() => stage.classList.remove('flipping'), 900);
  paintNotes(true);
}

function paintNotes(fly) {
  const notes = state.items.filter((d) => d.section === 'note');
  const { noteTab: tab, noteSub: sub } = state;
  const q = state.noteQ.trim().toLowerCase();
  const inTab = (d, t) => t === 'all' || d.tab === t;
  const tabs = [['all', '전체']].concat(Object.keys(NOTE_TABS).map((k) => [k, NOTE_TABS[k].label]));
  document.getElementById('big-tabs').innerHTML = tabs.map(([id, label]) => {
    const on = id === tab;
    return `<button type="button" class="big pencil p-${id}${on ? ' on' : ''}" aria-pressed="${on}" data-tab="${id}"><span>${label}</span><span class="n">${notes.filter((d) => inTab(d, id)).length}</span></button>`;
  }).join('');
  const subBox = document.getElementById('sub-tabs');
  if (tab === 'all') subBox.innerHTML = '';
  else {
    const subs = [['all', '전체']].concat(Object.entries(NOTE_TABS[tab].subs));
    subBox.innerHTML = subs.map(([id, label]) => `<button type="button" class="sub${id === sub ? ' on' : ''}" aria-pressed="${id === sub}" data-sub="${id}">${label}</button>`).join('');
  }
  subBox.hidden = tab === 'all';
  const list = notes.filter((d) => inTab(d, tab) && (sub === 'all' || d.sub === sub) && (!q || d.title.toLowerCase().includes(q)));
  const label = tab === 'all' ? '전체' : NOTE_TABS[tab].label + (sub === 'all' ? '' : ' · ' + NOTE_TABS[tab].subs[sub]);
  document.getElementById('result-label').textContent = `${label}${q ? ` · "${state.noteQ.trim()}" 검색` : ''} · ${list.length}개`;
  const box = document.getElementById('doc-list');
  box.innerHTML = list.length ? list.map(noteCard).join('') : '<div class="doc-empty">해당하는 기록이 없어요.</div>';
  if (fly) launchFromBook(box);
}

function renderSecret() {
  const body = state.secret
    ? `<div class="result-label">시크릿 ${state.secret.length}개</div>
       <div class="doc-list">${state.secret.length ? state.secret.map(docRow).join('') : '<div class="doc-empty">서랍이 비어 있어요. 새 재료를 넣을 때 "시크릿 서랍에 넣기"를 체크하세요.</div>'}</div>
       <button type="button" class="relock" data-act="relock" style="align-self:flex-start">다시 잠그기</button>`
    : `<div style="display:flex;justify-content:center;padding-top:20px">${lockCard('page')}</div>`;
  app.innerHTML = `<div class="wrap secret-screen">
    ${topbar(true)}
    <section class="notes-head"><div>
      <div class="ttl"><span class="ic" style="background:#3D4450;color:#FFFFFF">${LOCK.replace('width="20" height="20"', 'width="28" height="28"')}</span><h1 style="color:#3D4450">시크릿 서랍</h1></div>
      <p>툴 주머니와 레시피 노트에서 "시크릿"으로 넣은 것만 모여 있어요.</p>
    </div></section>
    ${body}
  </div>`;
  bindLockCard();
}

// ---------- 새 재료 넣기 ----------
function openSheet(section, edit) {
  if (edit) section = edit.section;
  const noteOpts = Object.entries(NOTE_TABS).map(([t, v]) => `<optgroup label="${v.label}">${Object.entries(v.subs).map(([s, l]) => `<option value="${t}/${s}">${l}</option>`).join('')}</optgroup>`).join('');
  sheetRoot.innerHTML = `<div class="sheet-back" id="sheet-back">
    <form class="sheet" id="add-form" role="dialog" aria-modal="true" aria-labelledby="add-title" novalidate>
      <h2 id="add-title">${edit ? '재료 고치기' : '새 재료 넣기'}</h2>
      <fieldset><legend>어디에 넣을까요?</legend>
        <div class="seg">
          <label><input type="radio" name="section" value="tool" ${section !== 'note' ? 'checked' : ''}><span>툴 주머니</span></label>
          <label><input type="radio" name="section" value="note" ${section === 'note' ? 'checked' : ''}><span>레시피 노트</span></label>
        </div>
      </fieldset>
      <div class="f"><label for="add-name">이름</label><input id="add-name" name="itemTitle" class="field-input" type="text" placeholder="예: 혈액검사 패키지 계산기" required></div>
      <fieldset><legend>종류</legend><div class="seg" id="kind-seg"></div></fieldset>
      <div class="f" id="f-url"><label for="add-url">주소</label><input id="add-url" name="url" class="field-input" type="url" placeholder="https://"></div>
      <div class="f" id="f-file"><label for="add-file">파일</label><input id="add-file" name="file" type="file"></div>
      <div class="f" id="f-body"><label for="add-body">멘트 내용</label><textarea id="add-body" name="body" class="field-input" placeholder="[원장님 반응] …&#10;[대응 멘트] …"></textarea></div>
      <div class="f" id="f-desc"><label for="add-desc">한 줄 설명</label><input id="add-desc" name="desc" class="field-input" type="text" placeholder="언제, 어떻게 쓰는 툴인지"></div>
      <fieldset id="f-pockets"><legend>어떤 자료인지 (여러 개 가능)</legend>
        <div class="opts">${POCKETS.map((p) => `<label><input type="checkbox" name="pockets" value="${p.id}"> ${p.label}</label>`).join('')}</div>
      </fieldset>
      <label id="f-mine" class="opts"><span><input type="checkbox" name="mine" checked> 스니자료예요 (내가 만든 것 · 빼면 DW자료)</span></label>
      <div class="f" id="f-cat"><label for="add-cat">분류</label><select id="add-cat" name="cat" class="field-input">${noteOpts}</select></div>
      <div class="f" id="f-date"><label for="add-date">날짜</label><input id="add-date" name="date" class="field-input" type="text" placeholder="예: 2026.10"></div>
      <p class="note" id="f-sensitive">거래처 실명, 동료 평가가 들어간 문서는 파일 대신 사내 드라이브 링크로 넣어주세요.</p>
      <div class="error" id="add-err" role="alert" hidden></div>
      <div class="btns"><button type="submit" class="go-btn">${edit ? '고치기 완료' : '쇽! 넣기'}</button><button type="button" class="ghost-btn" data-act="close-sheet">취소</button></div>
    </form>
  </div>`;
  const form = document.getElementById('add-form');
  const sync = () => {
    const sec = form.querySelector('input[name=section]:checked').value;
    const kinds = sec === 'note' ? NOTE_KINDS : TOOL_KINDS;
    const seg = document.getElementById('kind-seg');
    const cur = form.querySelector('input[name=kind]:checked')?.value;
    if (seg.dataset.sec !== sec) {
      seg.dataset.sec = sec;
      seg.innerHTML = kinds.map((k, i) => `<label><input type="radio" name="kind" value="${k.id}" ${i === 0 ? 'checked' : ''}><span>${k.label}</span></label>`).join('');
      seg.querySelectorAll('input').forEach((r) => r.addEventListener('change', sync));
    }
    const kind = form.querySelector('input[name=kind]:checked')?.value || cur;
    const isTool = sec === 'tool';
    document.getElementById('f-url').hidden = !(kind === 'URL' || kind === 'HTML' || kind === 'LINK' || kind === 'BD');
    document.getElementById('f-file').hidden = !isFileKind(kind);
    document.getElementById('f-body').hidden = kind !== 'MENT';
    document.getElementById('f-desc').hidden = !isTool;
    document.getElementById('f-pockets').hidden = !isTool;
    document.getElementById('f-mine').hidden = !isTool;
    document.getElementById('f-cat').hidden = isTool;
    document.getElementById('f-date').hidden = isTool;
    document.getElementById('f-sensitive').hidden = isTool;
    document.getElementById('add-file').accept = { PDF: '.pdf', IMG: 'image/*', BD: '.pdf,.ppt,.pptx,image/*', PPT: '.ppt,.pptx', DOCX: '.doc,.docx,.hwp' }[kind] || '';
  };
  form.querySelectorAll('input[name=section]').forEach((r) => r.addEventListener('change', sync));
  sync();
  if (edit) {
    const k = form.querySelector(`input[name=kind][value="${edit.kind}"]`);
    if (k) k.checked = true;
    document.getElementById('add-name').value = edit.title;
    if (!edit.filePath) document.getElementById('add-url').value = edit.url || '';
    document.getElementById('add-body').value = edit.body || '';
    document.getElementById('add-desc').value = edit.desc || '';
    form.querySelectorAll('input[name=pockets]').forEach((c) => { c.checked = (edit.pockets || []).includes(c.value); });
    form.querySelector('input[name=mine]').checked = !!edit.mine;
    if (edit.tab) document.getElementById('add-cat').value = `${edit.tab}/${edit.sub}`;
    document.getElementById('add-date').value = edit.date || '';
    if (edit.filePath) document.querySelector('#f-file label').textContent = '파일 (새로 고르면 바꿔요)';
    sync();
  }
  document.getElementById('add-name').focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('add-err');
    const fd = new FormData(form);
    const sec = fd.get('section');
    const kind = fd.get('kind');
    const item = { section: sec, title: (fd.get('itemTitle') || '').trim(), kind, secret: !!fd.get('secret') };
    const file = document.getElementById('add-file').files[0];
    if (!item.title) return showErr('이름을 넣어주세요.');
    if (!form.querySelector('#f-url').hidden) {
      item.url = (fd.get('url') || '').trim();
      if (kind === 'BD' && !item.url) item.url = '';
      else if (!/^https?:\/\//.test(item.url)) return showErr(kind === 'BD' ? 'BD는 파일을 고르거나 https:// 주소를 넣어주세요.' : '주소는 https:// 로 시작해야 해요.');
    }
    const hasOldFile = edit && edit.filePath && edit.kind === kind;
    if (kind === 'BD' && !item.url && !file && !hasOldFile) return showErr('BD는 파일을 고르거나 https:// 주소를 넣어주세요.');
    if (isFileKind(kind) && kind !== 'BD' && !file && !hasOldFile) return showErr('파일을 골라주세요.');
    if (item.url) item.filePath = '';
    else if (!file && !hasOldFile) item.filePath = '';
    if (kind === 'MENT') {
      item.body = (fd.get('body') || '').trim();
      if (!item.body) return showErr('멘트 내용을 넣어주세요.');
    }
    if (sec === 'tool') {
      item.desc = (fd.get('desc') || '').trim();
      item.pockets = fd.getAll('pockets');
      item.mine = !!fd.get('mine');
    } else {
      [item.tab, item.sub] = String(fd.get('cat')).split('/');
      item.date = (fd.get('date') || '').trim();
    }
    try {
      form.querySelector('button[type=submit]').disabled = true;
      if (edit) await db.updateItem(edit.id, item, file, edit);
      else await db.addItem(item, file);
      await reload();
      if (state.secret) state.secret = await db.unlockSecret(state.secretPw);
      closeSheet();
      toast(edit ? '고쳤어요' : item.secret ? '시크릿 서랍에 쏙 넣었어요' : sec === 'note' ? '레시피 노트에 넣었어요' : '주머니에 쏙 넣었어요');
      route();
    } catch (ex) {
      showErr(ex.message || '넣지 못했어요. 다시 해주세요.');
      form.querySelector('button[type=submit]').disabled = false;
    }
    function showErr(m) { err.textContent = m; err.hidden = false; }
  });
}
function closeSheet() { sheetRoot.innerHTML = ''; }

// ---------- 이벤트 ----------
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-act],[data-purpose],[data-ftype],[data-pick],[data-copy],[data-tab],[data-sub],[data-edit],[data-del]');
  if (!t) {
    if (e.target.id === 'sheet-back') closeSheet();
    return;
  }
  if (t.dataset.edit) {
    const d = findItem(t.dataset.edit);
    if (d) openSheet(d.section, d);
    return;
  }
  if (t.dataset.del) {
    // 한 번 더 눌러야 지운다
    if (!t.classList.contains('armed')) {
      t.classList.add('armed');
      t.innerHTML = '정말 지울까요?';
      setTimeout(() => { if (t.isConnected) { t.classList.remove('armed'); t.innerHTML = TRASH; } }, 3000);
      return;
    }
    const d = findItem(t.dataset.del);
    try {
      await db.deleteItem(d.id, d);
      await reload();
      if (state.secret) state.secret = await db.unlockSecret(state.secretPw);
      if (state.picked === d.id) state.picked = null;
      toast('지웠어요');
      route();
    } catch (ex) { toast(ex.message || '지우지 못했어요'); }
    return;
  }
  if (t.dataset.purpose || t.dataset.ftype) {
    const key = t.dataset.purpose ? 'purpose' : 'ftype';
    const val = t.dataset[key];
    const pq = document.getElementById('pq');
    if (pq) pq.value = '';
    stir({ [key]: state[key] === val && !state.secretView && !state.pq.trim() ? '' : val, pq: '', secretView: false, picked: null });
  } else if (t.dataset.pick) {
    state.picked = t.dataset.pick;
    document.querySelectorAll('.tile').forEach((el) => el.classList.toggle('on', el.dataset.pick === state.picked));
    paintDetail();
  } else if (t.dataset.copy) {
    const d = findItem(t.dataset.copy);
    try { await navigator.clipboard.writeText(d.body || ''); toast('멘트를 복사했어요'); } catch { toast('복사하지 못했어요'); }
  } else if (t.dataset.tab) {
    state.noteTab = t.dataset.tab; state.noteSub = 'all'; flipBook();
  } else if (t.dataset.sub) {
    state.noteSub = t.dataset.sub; flipBook();
  } else {
    const act = t.dataset.act;
    if (act === 'stir') stir({});
    else if (act === 'secret-view') stir({ secretView: !state.secretView, picked: null });
    else if (act === 'flip') flipBook();
    else if (act === 'add') openSheet(t.dataset.section);
    else if (act === 'close-sheet') closeSheet();
    else if (act === 'relock') {
      state.secret = null;
      state.secretPw = '';
      db.lockSecret();
      if (state.secretView) { state.secretView = false; state.picked = null; }
      route();
    } else if (act === 'signout') {
      await db.signOut();
      Object.assign(state, { items: [], secret: null, secretPw: '', purpose: '', ftype: '', pq: '', secretView: false, picked: null });
      go('enter');
    }
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheetRoot.firstChild) closeSheet(); });

(async function start() {
  if (await db.getSession()) await reload();
  route();
})();
})();
