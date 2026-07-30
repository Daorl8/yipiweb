/* ─────────────────────────────────────────────────────────────
 * yw-beacon.js — 이피웹 인사이트 비콘 (단일 소스)
 * 정본 설계 = 문서/인사이트_수집_설계.md §5 + §10
 * ─────────────────────────────────────────────────────────────
 * 홈페이지 6페이지: index + nakseo + art/y2k/maximal/premiere. 상대경로 <script src="/yw-beacon.js">.
 * 가상 샘플(stay·flower·cafe·object …): 절대 URL <script src="https://yipiweb.lgt3232.workers.dev/yw-beacon.js">
 *   로 이 파일 하나를 참조(진짜 단일 소스). ⚠️ 실고객 사이트엔 절대 넣지 않음(개인정보·소유).
 *   ⚠️ 로직은 여기 한 곳뿐. 고칠 때 이 파일만 고치고 재배포하면 전부 반영.
 *      (2026-07-16 교훈: 중복본은 유지보수 지옥 + '어느 게 진짜냐' 오판을 부른다)
 *
 * 경로: 브라우저 ──(CORS fetch)──> CF Worker(yw-collect) ──> Apps Script /exec ──> 시트
 *   ⚠️ Apps Script 직행 X. no-cors 직행은 응답이 불투명해 실패가 안 보였다(§10-8).
 *   ⚠️ 세션 키는 반드시 'yw_sid'. 'sid' 로 보내면 구글 프론트가 doPost 전에 400 으로 자른다
 *      (2026-07-16 실측: sid= 0/6 성공, yw_sid= 6/6). 시트 컬럼명(sid)은 Apps Script 가 맞춰줌.
 *
 * 이벤트:
 *   page_view · section_view(section[id] 자동) · exit(scroll_max·secs)
 *   click_case  = 실고객 사례 클릭 (#case 안) — 신뢰 강신호
 *   click_lab   = 낙서장 실험작 타일 클릭 (.tile)
 *   click_work  = 가상 샘플 클릭 (workers.dev, #case 아님)
 *   click_channel(instagram/email/phone/kakao/kakao_map/naver_booking/naver_store/naver_place) · click_cta · form_submit · popup_shown/close
 *   page 컬럼 = location.host+pathname (샘플들이 각자 도메인의 '/' 라 host 로 구분)
 * ───────────────────────────────────────────────────────────── */
(function(){
  var EP = 'https://daorl8-yw-collect.lgt3232.workers.dev/';
  var K  = 'yw_a8f3k1qz';
  if(!EP || !K) return;

  // 1) 자기 방문 제외 (?admin=1 로 한 번 접속 → 이후 미수집, ?admin=0 해제)
  try{
    var q0 = new URLSearchParams(location.search);
    if(q0.get('admin')==='1') localStorage.setItem('yw_admin','1');
    if(q0.get('admin')==='0') localStorage.removeItem('yw_admin');
    if(localStorage.getItem('yw_admin')==='1') return;
  }catch(e){}

  // 2) 봇 제외
  var ua = navigator.userAgent || '';
  if(/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|bingpreview/i.test(ua)) return;

  // 3) 세션 ID (탭 단위 · 쿠키 아님 · 재방문 추적 안 함)
  var sid='nostore';
  try{
    sid = sessionStorage.getItem('yw_sid');
    if(!sid){ sid = Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); sessionStorage.setItem('yw_sid',sid); }
  }catch(e){}

  // 4) 환경 판별
  var qp = new URLSearchParams(location.search);
  var device = /iPad|Tablet/i.test(ua) ? 'tablet' : (/Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop');
  var os = /iPhone|iPad|iPod/i.test(ua)?'iOS' : /Android/i.test(ua)?'Android' : /Mac OS X/i.test(ua)?'macOS' : /Windows/i.test(ua)?'Windows' : 'other';
  var browser = /Edg/i.test(ua)?'Edge' : /SamsungBrowser/i.test(ua)?'Samsung' : /CriOS|Chrome/i.test(ua)?'Chrome'
              : (/Safari/i.test(ua)&&!/Chrome|CriOS/i.test(ua))?'Safari' : /Firefox|FxiOS/i.test(ua)?'Firefox' : 'other';
  var inapp = /Instagram/i.test(ua)?'instagram' : /KAKAOTALK/i.test(ua)?'kakaotalk' : /FBAN|FBAV/i.test(ua)?'facebook'
            : /NAVER\(inapp/i.test(ua)?'naver' : /DaumApps/i.test(ua)?'daum' : /Line\//i.test(ua)?'line' : '';

  var scrollMax = 0, t0 = Date.now(), sent = {}, exited = false;

  function send(ev, detail, value, extra, beacon){
    var d = {
      k:K, event:ev, page:(location.host+location.pathname), detail:detail||'', value:(value==null?'':String(value)),
      utm_source:qp.get('utm_source')||'', utm_medium:qp.get('utm_medium')||'',
      utm_campaign:qp.get('utm_campaign')||'', utm_content:qp.get('utm_content')||'',
      referrer:document.referrer||'', inapp:inapp, device:device, os:os, browser:browser,
      // page = host+pathname: 가상 샘플들이 각자 도메인의 '/' 라 host 없으면 서로·홈페이지와 구분 불가
      viewport:(innerWidth+'x'+innerHeight), lang:navigator.language||'', yw_sid:sid,
      scroll_max:(extra&&extra.scroll_max!=null)?String(extra.scroll_max):'',
      secs:(extra&&extra.secs!=null)?String(extra.secs):''
    };
    var body = new URLSearchParams(d).toString();
    try{
      if(beacon && navigator.sendBeacon){
        var q = navigator.sendBeacon(EP, new Blob([body],{type:'application/x-www-form-urlencoded;charset=UTF-8'}));
        if(!q) console.warn('[yw-collect] '+ev+' → sendBeacon 큐 거부');
      }else{
        fetch(EP,{method:'POST',keepalive:true,
          headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:body})
          .then(function(r){ return r.text().then(function(t){
              if(!r.ok || t.slice(0,3)!=='OK ') console.warn('[yw-collect] '+ev+' → '+r.status+' '+t);
            }); })
          .catch(function(e){ console.warn('[yw-collect] '+ev+' → 전송 실패: '+(e&&e.message)); });
      }
    }catch(e){ console.warn('[yw-collect] '+ev+' → '+(e&&e.message)); }
  }

  // 5) 방문 (DOM 불필요 — 즉시)
  send('page_view', document.title||'');

  // 6) 클릭 위임 (document 에 붙으므로 DOM 준비 무관). 판정 순서 = case → lab → work → channel → cta
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if(!a) return;
    var href = a.getAttribute('href')||'';
    var txt  = (((a.textContent||'').trim()) || a.getAttribute('aria-label') || '').slice(0,60);
    if(a.closest('#yw-bridge')){                                  // 샘플→이피웹 브릿지 배지 (click_work로 안 새게 먼저 분기)
      send('click_bridge', 'to_home'); return;
    }
    if(a.closest('#case')){                                       // 실고객 사례 = 신뢰 강신호
      var _cc=a.closest('.casecard'); var _nm=_cc&&_cc.getAttribute('data-case');
      send('click_case', _nm || txt || href);
    }else if(a.classList && a.classList.contains('tile')){        // 낙서장 실험작 타일
      send('click_lab', txt || href);
    }else if(/workers\.dev/i.test(href)){                         // 가상 샘플 = 어떤 업종이 먹히나
      send('click_work', txt || href.replace(/^https?:\/\//,'').split('.')[0]);
    }else{                                                        // 문의/전환 채널 판정 (href 기준)
      var ch = '';
      if(/^tel:/i.test(href))                       ch='phone';         // 전화
      else if(/^mailto:/i.test(href))               ch='email';
      else if(/instagram\.com|ig\.me/i.test(href))  ch='instagram';
      else if(/booking\.naver/i.test(href))         ch='naver_booking'; // 네이버 예약 = 전환 강신호
      else if(/smartstore\.naver|brand\.naver/i.test(href)) ch='naver_store'; // 스마트스토어 구매
      else if(/place\.naver|map\.naver|naver\.me/i.test(href)) ch='naver_place'; // 플레이스·길찾기(약신호)
      else if(/pf\.kakao|open\.kakao|qr\.kakao/i.test(href)) ch='kakao'; // 카톡 문의 = 전환
      else if(/map\.kakao/i.test(href))             ch='kakao_map';     // 카카오맵 길찾기(약신호)
      if(ch){
        send('click_channel', ch);
      }else if(a.classList && (a.classList.contains('btn-primary')||a.classList.contains('btn-ghost')||a.classList.contains('nav-cta'))){
        send('click_cta', txt);
      }
    }
  }, true);

  // 10) 스크롤 최대 깊이 (window — DOM 준비 무관)
  addEventListener('scroll', function(){
    try{
      var h = document.documentElement.scrollHeight - innerHeight;
      if(h>0){ var p = Math.round((scrollY/h)*100); if(p>scrollMax) scrollMax = Math.min(p,100); }
    }catch(e){}
  }, {passive:true});

  // 11) 이탈 시 1회: 최대 스크롤 % + 체류 초
  function exit(){
    if(exited) return; exited = true;
    send('exit','', '', {scroll_max:scrollMax, secs:Math.round((Date.now()-t0)/1000)}, true);
  }
  addEventListener('pagehide', exit);
  addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') exit(); });

  // DOM 준비 후: 섹션 도달 관찰 + 폼 + 팝업
  function initDom(){
    // 6) 섹션 도달 — 그 페이지의 모든 section[id] 자동 관찰 (페이지마다 목록 안 넘겨도 됨)
    try{
      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(entries){
          entries.forEach(function(en){
            if(en.isIntersecting){
              var id = en.target.id;
              if(id && !sent['sec_'+id]){ sent['sec_'+id]=1; send('section_view', id); }
            }
          });
        },{threshold:.35});
        var secs = document.querySelectorAll('section[id]');
        for(var i=0;i<secs.length;i++) io.observe(secs[i]);
      }
    }catch(e){}

    // 8) 문의 폼 제출 (index.html 에만 있음 — 없으면 자동 스킵)
    try{
      var cf = document.getElementById('cform');
      if(cf) cf.addEventListener('submit', function(){ send('form_submit',''); }, true);
    }catch(e){}

    // 9) 이벤트 팝업 반응 (index.html 에만 — 없으면 스킵)
    try{
      var em = document.getElementById('evtModal');
      if(em && 'MutationObserver' in window){
        var wasOpen = !em.hidden;
        new MutationObserver(function(){
          var open = !em.hidden;
          if(open && !wasOpen) send('popup_shown','event');
          if(!open && wasOpen) send('popup_close','event');
          wasOpen = open;
        }).observe(em,{attributes:true,attributeFilter:['hidden']});
      }
    }catch(e){}
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', initDom); } else { initDom(); }

  // ── 브릿지 배지: 가상 샘플 → 이피웹 홈 (구경꾼→리드 전환용, 비콘 있는 곳만 = 실고객 자동 제외) ──
  function showBridge(){
    var host = location.host, path = location.pathname;
    // yipiweb 도메인: 홈(/)·낙서장 제외, 정식 샘플(tattoo·lash)만 표시
    if(/yipiweb\.lgt3232\.workers\.dev$/i.test(host)) return /^\/(tattoo|lash)\.html$/i.test(path);
    // 그 외 *.workers.dev = 별도 도메인 가상 샘플 → 표시
    if(/\.workers\.dev$/i.test(host)) return true;
    return false; // 그 외(실고객 커스텀 도메인 등)엔 안 뜸 — 애초에 비콘도 없음
  }
  function mountBridge(){
    try{
      if(!showBridge() || document.getElementById('yw-bridge') || !document.body) return;
      var css = document.createElement('style');
      css.textContent =
        '#yw-bridge{position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:2147483000;'
        +'display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:100px;'
        +'background:rgba(22,22,26,.9);color:#fff;text-decoration:none;max-width:80vw;'
        +'font:600 12.5px/1 -apple-system,BlinkMacSystemFont,"Pretendard","Apple SD Gothic Neo","Malgun Gothic",sans-serif;letter-spacing:-.01em;'
        +'box-shadow:0 6px 22px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.14);'
        +'-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .15s}'
        +'#yw-bridge:hover{transform:translateY(-2px)}'
        +'#yw-bridge b{opacity:.62;font-weight:400}#yw-bridge i{font-style:normal;white-space:nowrap}#yw-bridge s{text-decoration:none;font-weight:700;margin-left:2px}'
        +'@media(max-width:640px){#yw-bridge{right:12px;bottom:calc(78px + env(safe-area-inset-bottom,0px));padding:8px 13px;font-size:12px}}';
      document.head.appendChild(css);
      var a = document.createElement('a');
      a.id = 'yw-bridge';
      a.href = 'https://yipiweb.lgt3232.workers.dev/?utm_source=sample_bridge&utm_medium=badge';
      a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label','이피웹 제작 샘플 — 내 가게도 만들기');
      a.innerHTML = '<b>이피웹 제작 샘플</b><i>· 내 가게도<s>→</s></i>';
      document.body.appendChild(a);
      // 모바일: 하단 전체폭 고정바(예약바 등) 있으면 그 위로 올림 (늦게 뜨는 바 대비 지연 재계산)
      function lift(){
        try{
          if(innerWidth>640) return;
          var mx = 0;
          var nodes = document.body.getElementsByTagName('*');
          for(var i=0;i<nodes.length;i++){ var el=nodes[i]; if(el.id==='yw-bridge') continue;
            var s=getComputedStyle(el); if(s.position!=='fixed'||s.display==='none') continue;
            var r=el.getBoundingClientRect();
            if(r.bottom>=innerHeight-2 && r.height>28 && r.height<170 && r.width>innerWidth*0.7) mx=Math.max(mx,r.height);
          }
          if(mx>0) a.style.bottom='calc('+(mx+12)+'px + env(safe-area-inset-bottom,0px))';
        }catch(e){}
      }
      lift(); setTimeout(lift, 900);
    }catch(e){}
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', mountBridge); } else { mountBridge(); }
})();
