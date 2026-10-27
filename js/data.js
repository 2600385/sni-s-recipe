// 데이터 창구. SNI_CONFIG가 있으면 Supabase, 없으면 예시 데이터로 돈다.
// 파일을 더블클릭으로 열어도 동작하도록 모듈이 아닌 일반 스크립트로 둔다.
(function () {

// 알사탕: 어디에 쓰는지
const POCKETS = [
  { id: 'propose', label: '신규처 제안' },
  { id: 'manage', label: '기존처 관리' }
];

// 리본사탕: 어떤 재료인지 (mine은 직접 만든 것, 나머지는 kind)
const FTYPES = [
  { id: 'mine', label: "스니's making" },
  { id: 'HTML', label: 'HTML' },
  { id: 'BD', label: 'BD' },
  { id: 'URL', label: 'URL' },
  { id: 'PDF', label: 'PDF' },
  { id: 'MENT', label: '표준멘트' }
];

const TOOL_KINDS = [
  { id: 'HTML', label: 'HTML 툴 (배포 주소)' },
  { id: 'URL', label: 'URL 주소' },
  { id: 'BD', label: 'BD (파일 또는 주소)' },
  { id: 'PDF', label: 'PDF (사업 지침·공문 등)' },
  { id: 'MENT', label: '표준멘트' }
];

const NOTE_KINDS = [
  { id: 'LINK', label: '드라이브 링크' },
  { id: 'PPT', label: 'PPT 파일' },
  { id: 'PDF', label: 'PDF 파일' },
  { id: 'DOCX', label: '문서 파일' }
];

const NOTE_TABS = {
  report: { label: '보고서', subs: { handover: '인수인계서', feedback: '월별 피드백', daily: '일일보고', etc: '기타 보고서' } },
  pres: { label: '발표용', subs: { team: '신사업팀 발표', monthly: '사무소 월례회의', inner: '내근회의', contest: '경진대회·외부' } }
};

const SAMPLE = [
  { id: 't1', section: 'tool', title: '일만사 수익 시뮬레이터', kind: 'HTML', url: '', mine: true, pockets: ['propose'], desc: '환자 수를 넣으면 일만사 예상 수익과 혈액검사 패키지 금액을 바로 보여줍니다.' },
  { id: 't2', section: 'tool', title: '일만사 등록 이지플래너', kind: 'HTML', url: '', mine: true, pockets: ['propose'], desc: '원장님께 일만사 수가 수입을 한눈에 보여주는 상담용 화면입니다.' },
  { id: 't3', section: 'tool', title: '검진센터 제안 브로셔', kind: 'HTML', url: '', mine: true, pockets: ['propose'], desc: '병원명과 담당자명을 입력하면 거래처 맞춤 일만사 제안 포스터가 만들어집니다.' },
  { id: 't4', section: 'tool', title: 'AX004 청구증대 툴', kind: 'HTML', url: 'https://ax004-claim-tool.netlify.app', mine: true, pockets: ['manage'], desc: '환자는 많은데 교육상담 청구가 낮은 거래처를 찾아냅니다.' },
  { id: 't5', section: 'tool', title: '청구현황 대시보드', kind: 'HTML', url: '', mine: true, pockets: ['manage'], desc: '사무소별 청구 순위, 월별 추이, 담당자별 현황을 탭으로 봅니다.' },
  { id: 't6', section: 'tool', title: '경인1 거래처 현황판', kind: 'HTML', url: '', mine: true, pockets: ['manage'], desc: '거래처별 방문 기록, 담당자 배정, 웰체크·일만사 참여 현황을 관리합니다.' },
  { id: 't7', section: 'tool', title: '예시 · 심평원 업무포털', kind: 'URL', url: '', mine: false, pockets: ['manage'], desc: '저장해 둔 외부 사이트 예시입니다. 실제 주소로 바꿔 넣으세요.' },
  { id: 't8', section: 'tool', title: '예시 · 일만사 사업 지침', kind: 'PDF', url: '', mine: false, pockets: ['propose', 'manage'], desc: '저장해 둔 PDF 자료 예시입니다. 실제 파일로 바꿔 넣으세요.' },
  { id: 't9', section: 'tool', title: '예시 · "인력이 없어요" 대응', kind: 'MENT', url: '', mine: true, pockets: ['propose'], desc: '원장님 반응별 표준멘트 예시입니다.', body: '[원장님 반응] 인력이 없어서 못 해요.\n[대응 멘트] 실제 쓰시는 멘트를 여기에 넣어주세요.' },
  { id: 't10', section: 'tool', title: '예시 · 일만사 제안 BD', kind: 'BD', url: '', mine: true, pockets: ['propose'], desc: '원장님께 드리는 일만사 소개 BD 예시입니다. 실제 파일로 바꿔 넣으세요.' },
  { id: 'n1', section: 'note', title: '웰체크를 통한 일만사 청구 TIP', kind: 'PPT', tab: 'pres', sub: 'contest', date: '2026.06', url: '' },
  { id: 'n2', section: 'note', title: '7월 복기 · 8월 목표', kind: 'PPT', tab: 'pres', sub: 'monthly', date: '2026.07', url: '' },
  { id: 'n3', section: 'note', title: '7월 웰체크 현황 · 8월 방향', kind: 'PPT', tab: 'pres', sub: 'inner', date: '2026.07', url: '' },
  { id: 'n4', section: 'note', title: '경인1~4 GAP 분석 보고서', kind: 'DOCX', tab: 'report', sub: 'etc', date: '', url: '' },
  { id: 'n5', section: 'note', title: '예시 · 경인1 인수인계서', kind: 'LINK', tab: 'report', sub: 'handover', date: '', url: '' },
  { id: 'n6', section: 'note', title: '예시 · 월별 피드백', kind: 'LINK', tab: 'report', sub: 'feedback', date: '', url: '' },
  { id: 'n7', section: 'note', title: '예시 · 일일보고 (월 묶음)', kind: 'LINK', tab: 'report', sub: 'daily', date: '', url: '' }
];

const SAMPLE_SECRET = [
  { id: 's1', section: 'tool', title: '예시 · 시크릿 툴', kind: 'URL', url: '', mine: true, pockets: ['manage'], secret: true, desc: '원장님 앞에서 화면을 띄울 때 보이면 안 되는 툴 예시입니다.' },
  { id: 's2', section: 'note', title: '예시 · 내부 복기 메모', kind: 'LINK', tab: 'report', sub: 'etc', date: '', url: '', secret: true }
];

// ---------- 예시 모드 (미리보기용) ----------
let items = SAMPLE.slice();
let secretItems = SAMPLE_SECRET.slice();
let signedIn = false;

const demo = {
  async getSession() { return signedIn; },
  async signIn(code) {
    if (!code) throw new Error('비밀 레시피를 넣어주세요.');
    signedIn = true; // 아무 코드나 통과
  },
  async signOut() { signedIn = false; },
  lockSecret() {},
  async listItems() { return items.slice(); },
  async unlockSecret(password) {
    if (!password) throw new Error('비밀번호를 넣어주세요.');
    return secretItems.slice();
  },
  async addItem(item, file) {
    const row = Object.assign({ id: 'x' + Date.now() }, item);
    if (file) row.url = URL.createObjectURL(file);
    (row.secret ? secretItems : items).unshift(row);
    return row;
  },
  async updateItem(id, item, file) {
    const old = items.concat(secretItems).find((d) => d.id === id);
    const row = Object.assign({}, old, item);
    if (file) row.url = URL.createObjectURL(file);
    items = items.filter((d) => d.id !== id);
    secretItems = secretItems.filter((d) => d.id !== id);
    (row.secret ? secretItems : items).unshift(row);
  },
  async deleteItem(id) {
    items = items.filter((d) => d.id !== id);
    secretItems = secretItems.filter((d) => d.id !== id);
  }
};

// ---------- 실제 저장소 (Supabase) ----------
const cfg = window.SNI_CONFIG || {};
const sb = !cfg.demo && cfg.url && window.supabase ? window.supabase.createClient(cfg.url, cfg.key) : null;
const BUCKET = 'files';
// 서랍 비밀번호가 확인되면 모든 요청에 실어 보내 시크릿 행을 다룰 수 있게 한다
function setSecretHeader(pw) {
  if (!sb) return;
  // 요청 헤더에는 한글을 실을 수 없어 UTF-8 → base64로 보낸다 (창고의 secret_ok가 되돌린다)
  if (pw) sb.rest.headers['x-secret-pw'] = btoa(String.fromCharCode(...new TextEncoder().encode(pw)));
  else delete sb.rest.headers['x-secret-pw'];
}

function fromRow(r) {
  return {
    id: r.id, section: r.section, title: r.title, kind: r.kind, url: r.url || '', filePath: r.file_path || '',
    body: r.body || '', desc: r.descr || '', pockets: r.pockets || [], mine: r.mine, tab: r.tab, sub: r.sub,
    date: r.doc_date || '', secret: r.secret
  };
}
function toRow(d) {
  const r = {
    section: d.section, title: d.title, kind: d.kind, url: d.url || null, body: d.body || null, descr: d.desc || null,
    pockets: d.pockets || [], mine: !!d.mine, tab: d.tab || null, sub: d.sub || null, doc_date: d.date || null, secret: !!d.secret
  };
  if (d.filePath !== undefined) r.file_path = d.filePath || null;
  return r;
}
// 비공개 파일은 열 때 쓸 임시 주소(1시간)를 붙인다
async function withFileUrls(list) {
  const paths = list.filter((d) => d.filePath).map((d) => d.filePath);
  if (!paths.length) return list;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrls(paths, 3600);
  if (error) return list;
  const map = {};
  data.forEach((x) => { if (x.signedUrl) map[x.path] = x.signedUrl; });
  list.forEach((d) => { if (d.filePath && map[d.filePath]) d.url = map[d.filePath]; });
  return list;
}
async function upload(file) {
  const { data: { user } } = await sb.auth.getUser();
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error('파일을 올리지 못했어요. 50MB 이하인지 확인해주세요.');
  return path;
}

const live = {
  async getSession() {
    const { data } = await sb.auth.getSession();
    return !!data.session;
  },
  async signIn(code) {
    if (!code) throw new Error('비밀 레시피를 넣어주세요.');
    let res;
    try {
      res = await sb.auth.signInWithPassword({ email: cfg.email, password: code });
    } catch (e) {
      throw new Error('창고에 연결하지 못했어요. 회사망에서 막혔을 수 있으니 휴대폰 데이터로 열어보세요.');
    }
    const error = res.error;
    if (!error) return;
    if (error.status === 429) throw new Error('너무 여러 번 시도했어요. 잠시 뒤에 다시 해주세요.');
    if (error.status === 400) throw new Error('레시피가 맞지 않아요.');
    throw new Error('창고에 연결하지 못했어요 (' + (error.status || error.name || '네트워크') + '). 회사망에서 막혔을 수 있으니 휴대폰 데이터로 열어보세요.');
  },
  async signOut() { setSecretHeader(''); await sb.auth.signOut(); },
  lockSecret() { setSecretHeader(''); },
  async listItems() {
    const { data, error } = await sb.from('items').select('*').eq('secret', false).order('created_at', { ascending: false });
    if (error) throw new Error('목록을 불러오지 못했어요.');
    return withFileUrls(data.map(fromRow));
  },
  async unlockSecret(password) {
    if (!password) throw new Error('비밀번호를 넣어주세요.');
    const { data, error } = await sb.rpc('get_secret_items', { pw: password });
    if (error) throw new Error(error.message === 'wrong_secret_password' ? '비밀번호가 맞지 않아요.' : '서랍을 열지 못했어요.');
    setSecretHeader(password);
    return withFileUrls(data.map(fromRow));
  },
  async addItem(item, file) {
    const d = Object.assign({}, item);
    if (file) d.filePath = await upload(file);
    const { error } = await sb.from('items').insert(toRow(d));
    if (error) throw new Error(d.secret ? '시크릿으로 넣으려면 시크릿 서랍을 먼저 열어주세요.' : '저장하지 못했어요. 다시 해주세요.');
  },
  async updateItem(id, item, file, old) {
    const d = Object.assign({}, item);
    if (file) d.filePath = await upload(file);
    const { error } = await sb.from('items').update(toRow(d)).eq('id', id);
    if (error) throw new Error(d.secret ? '시크릿으로 바꾸려면 시크릿 서랍을 먼저 열어주세요.' : '고치지 못했어요. 다시 해주세요.');
    if (file && old && old.filePath) await sb.storage.from(BUCKET).remove([old.filePath]);
  },
  async deleteItem(id, old) {
    const { error } = await sb.from('items').delete().eq('id', id);
    if (error) throw new Error('지우지 못했어요. 다시 해주세요.');
    if (old && old.filePath) await sb.storage.from(BUCKET).remove([old.filePath]);
  }
};

const impl = sb ? live : demo;
const isDemo = !sb;
const getSession = () => impl.getSession();
const signIn = (code) => impl.signIn(code);
const signOut = () => impl.signOut();
const lockSecret = () => impl.lockSecret();
const listItems = () => impl.listItems();
const unlockSecret = (pw) => impl.unlockSecret(pw);
const addItem = (item, file) => impl.addItem(item, file);
const updateItem = (id, item, file, old) => impl.updateItem(id, item, file, old);
const deleteItem = (id, old) => impl.deleteItem(id, old);

window.SNIData = {
  POCKETS, FTYPES, TOOL_KINDS, NOTE_KINDS, NOTE_TABS,
  isDemo, getSession, signIn, signOut, lockSecret, listItems, unlockSecret, addItem, updateItem, deleteItem
};
})();
