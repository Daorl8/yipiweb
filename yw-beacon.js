/* ─────────────────────────────────────────────────────────────
 * yw-beacon.js — 이피웹 인사이트 비콘 (단일 소스)
 * 정본 설계 = 문서/인사이트_수집_설계.md §5 + §10
 * ─────────────────────────────────────────────────────────────
 * 6개 페이지 공용: index.html + nakseo.html + art/y2k/maximal/premiere.html
 *   각 페이지는 </body> 앞에 <script src="/yw-beacon.js"></script> 한 줄만 넣는다.
 *   ⚠️ 로직은 여기 한 곳뿐. 고칠 때 이 파일만 고치고 재배포하면 6개 다 반영.
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
 *   click_channel(instagram/email) · click_cta · form_submit · popup_shown/close
 *   page 컬럼(location.pathname)으로 어느 페이지인지 구분(/ · /nakseo.html · /art.html …)
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
    if(a.closest('#case')){                                       // 실고객 사례 = 신뢰 강신호
      send('click_case', txt || href);
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
})();
