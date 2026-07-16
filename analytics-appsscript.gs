/**
 * 이피웹 — 인사이트 이벤트 수집 웹앱 (Google Apps Script)
 * v2 (2026-07-16) — 진단 계측 추가.  정본 설계 = 문서/인사이트_수집_설계.md §5 + §10
 * ────────────────────────────────────────────────────────
 * 목적: 사이트 비콘이 보낸 이벤트를 구글 시트 'events' 탭에 한 행씩 적립.
 * ⚠️ 기존 "문의 폼" 스크립트와 분리된 별개 웹앱이다(폼을 건드리지 않기 위해).
 *
 * ── v2 에서 달라진 것 ─────────────────────────────────
 * 1) doPost 첫 줄에서 PropertiesService 에 도달 카운터 기록 (토큰 검사보다 먼저).
 *    → "요청이 도달했는가" 를 시트와 무관하게 관측. 시트가 죽어도 이건 산다.
 * 2) catch 가 에러를 삼키지 않고 last_error 에 적는다.
 *    ⚠️ 시트가 아니라 Properties 에 — 시트에 적으면 "시트가 문제일 때 에러 기록도 같이 죽는" 오염 재발.
 * 3) doGet?debug=TOKEN → 카운터를 텍스트로 반환. 시크릿창에서 눈으로 확인 가능.
 *    (실행로그=익명 미기록 / 시트=오염 가능 / no-cors 응답=불투명 → 이 채널만 신뢰 가능)
 * 4) ts 를 Date 객체가 아닌 KST 문자열로 기록 → 타임존 의존 제거(-16h 미스터리 우회).
 * 5) LockService = 동시 appendRow 유실 방어(보험. 단독 원인이 아님은 이미 반증됨 — 베팅 금지).
 *
 * ── 판정표 (§10-5) ───────────────────────────────────
 *   hit_count↑ · 행無 · last_error有  → 서버 내부에서 죽음. last_error 가 범인 지목
 *   hit_count↑ · 행無 · last_error無  → 동시 appendRow 유실 유력 → Lock 으로 종결
 *   hit_count 정지                    → 진짜 전송 문제 → 즉시 CF Worker 프록시로 전환
 * ⚠️ 판정은 폰(셀룰러)/시크릿창 실방문으로만. 로그인 브라우저·자동화 탭 결과는 증거로 쓰지 말 것.
 *
 * ⚠️ 보안 메모: TOKEN 은 페이지 소스에 노출되므로 "진짜 보안"이 아니다(떠돌이 봇 차단용).
 *    ※ 개인정보(문의 내용·이메일)는 이 스크립트로 절대 보내지 말 것 — 기존 폼 스크립트에서만 처리.
 */

// ── 설정 ──────────────────────────────────────────────
const SHEET_ID = '1dsnm4BJrLfFos9AJqidTVKlDoWsPbc0KLECB74bBHGI';  // 다올 이벤트 시트
const TOKEN    = 'yw_a8f3k1qz';                                    // index.html 비콘의 K 와 동일
const TAB      = 'events';
const TZ       = 'Asia/Seoul';

const HEADERS = [
  'ts','event','page','detail','value',
  'utm_source','utm_medium','utm_campaign','utm_content',
  'referrer','inapp','device','os','browser','viewport','lang',
  'sid','scroll_max','secs'
];

// ── 진단 계측 (PropertiesService = Sheets 와 독립 저장소) ──
function _now() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}

/** val 없으면 카운터 +1, 있으면 값 기록. 절대 예외를 밖으로 던지지 않는다. */
function _mark(key, val) {
  try {
    const p = PropertiesService.getScriptProperties();
    if (val === undefined) {
      p.setProperty(key, String(Number(p.getProperty(key) || 0) + 1));
    } else {
      p.setProperty(key, String(val).slice(0, 800));
    }
  } catch (e) { /* 계측 실패가 수집을 막으면 안 됨 */ }
}

// ── 수집 엔드포인트 ────────────────────────────────────
function doPost(e) {
  // ⚠️ 토큰 검사보다 먼저. "도달했는가" 는 시트와 무관하게 남아야 한다.
  _mark('hit_count');
  _mark('last_hit', _now());

  try {
    const p = (e && e.parameter) ? e.parameter : {};

    if (p.k !== TOKEN) { _mark('last_error', _now() + ' | TOKEN_MISMATCH | k=' + p.k); return _ok(); }
    if (!p.event)      { _mark('last_error', _now() + ' | NO_EVENT');                  return _ok(); }

    const row = HEADERS.map(function (h) {
      if (h === 'ts') return _now();                    // 문자열 = 타임존 변환 없음
      // ⚠️ 'sid' 컬럼만 비콘이 'yw_sid' 로 보낸다. 파라미터 이름이 'sid' 이면 구글 프론트가
      //    doPost 실행 전에 400(Docs 에러 HTML)으로 잘라버린다 — 2026-07-16 실측으로 확정:
      //    실제형 sid 20자 랜덤값 기준 sid= 0/6 성공 / yw_sid= 6/6 성공, hit_count 불변(=미도달).
      //    이것이 2세션짜리 '비콘 미적립' 미스터리의 진짜 원인이었다. 시트 컬럼명은 그대로 유지.
      var v = p[(h === 'sid') ? 'yw_sid' : h];
      if (v === undefined && h === 'sid') v = p.sid;    // 구버전 비콘 호환 폴백
      return (v === undefined || v === null) ? '' : String(v).slice(0, 500);
    });

    // 보험: 동시 appendRow 유실 방어. 락을 못 얻어도 그냥 진행한다(유실 < 미수집).
    const lock = LockService.getScriptLock();
    let locked = false;
    try { locked = lock.tryLock(10000); } catch (e2) { _mark('last_error', _now() + ' | LOCK_FAIL | ' + e2); }
    try {
      _sheet().appendRow(row);
      _mark('last_ok', _now() + ' | ' + p.event);
    } finally {
      if (locked) { try { lock.releaseLock(); } catch (e3) {} }
    }

  } catch (err) {
    // ⚠️ 여기가 v1 에서 조용히 삼키던 지점. 이제 범인을 지목한다.
    _mark('last_error', _now() + ' | ' + (err && err.message ? err.message : String(err)));
  }
  return _ok();
}

// ── 관측 채널 (시크릿창에서 GET 으로 확인) ───────────────
function doGet(e) {
  const q = (e && e.parameter) ? e.parameter : {};

  if (q.debug === TOKEN) {
    let props = {};
    try { props = PropertiesService.getScriptProperties().getProperties(); } catch (er) {}
    let rows = '?';
    try { rows = String(_sheet().getLastRow() - 1); } catch (er) { rows = 'SHEET_ERR: ' + er; }
    const out = [
      'hit_count  : ' + (props.hit_count  || '0'),
      'last_hit   : ' + (props.last_hit   || '-'),
      'last_ok    : ' + (props.last_ok    || '-'),
      'last_error : ' + (props.last_error || '-'),
      'sheet_rows : ' + rows,
      'scriptTZ   : ' + Session.getScriptTimeZone(),
      'now(KST)   : ' + _now()
    ].join('\n');
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.TEXT);
  }

  if (q.reset === TOKEN) {
    try { PropertiesService.getScriptProperties().deleteAllProperties(); } catch (er) {}
    return ContentService.createTextOutput('reset ok').setMimeType(ContentService.MimeType.TEXT);
  }

  return _ok();  // 헬스체크
}

// ── 내부 ──────────────────────────────────────────────
function _sheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');  // ⚠️ ts 문자열이 Date 로 자동변환되는 것 방지
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function _ok() {
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * (선택) 월별 아카이브 — events 행이 너무 많아지면 수동 실행.
 * ⚠️ v2 에서 ts 가 문자열이 되었으므로 비교 로직 교체됨.
 *    (v1 의 `r[0] instanceof Date` 를 그대로 두면 아카이브가 영구히 아무것도 안 옮긴다 — 조용한 무력화)
 *    'yyyy-MM-dd HH:mm:ss' 는 사전순 비교 = 시간순 비교라 문자열 비교로 충분.
 */
function archiveOldEvents() {
  const sh = _sheet();
  const last = sh.getLastRow();
  if (last < 2) return;

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 1);
  cutoff.setDate(1);
  cutoff.setHours(0, 0, 0, 0);
  const cut = Utilities.formatDate(cutoff, TZ, 'yyyy-MM-dd HH:mm:ss');

  const data = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const keep = [], move = [];
  data.forEach(function (r) {
    const ts = (r[0] instanceof Date)
      ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd HH:mm:ss')   // v1 시절 Date 행 호환
      : String(r[0] || '');
    (ts && ts < cut) ? move.push(r) : keep.push(r);
  });
  if (!move.length) return;

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const name = 'events_archive';
  let ar = ss.getSheetByName(name);
  if (!ar) { ar = ss.insertSheet(name); ar.appendRow(HEADERS); }
  ar.getRange(ar.getLastRow() + 1, 1, move.length, HEADERS.length).setValues(move);

  sh.getRange(2, 1, last - 1, HEADERS.length).clearContent();
  if (keep.length) sh.getRange(2, 1, keep.length, HEADERS.length).setValues(keep);
}
