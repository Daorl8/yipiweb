# CHANGELOG — yipiweb (이피웹 전용 사이트)

## 2026-07-19 (3) — 낙서장(SCRATCHPAD) 신설: 실험작 3 + 허브 + 메인 연결
- **컨셉:** "팔 생각 없이, 만들고 싶은 대로" 만든 실험작 모음 = 이피웹의 다른 얼굴. 샘플(전환 자산)과 분리 — 별도 페이지 라인으로. (다올 결정: 3탭 아님, 메인+낙서장 2탭 / 샘플은 메인 유지.)
- **허브 `nakseo.html`:** 다크 에디토리얼 진열장. 3개 실험작을 각자 무드 색 스와치로 미리보기(외부 이미지 0, CSS만). 딥블루 시그니처 유지로 이피웹 유니버스 소속감. 각 타일 → 실험작 풀페이지.
- **실험작 3종(각각 화면 통째 점령하는 단일 컨셉):**
  - 001 `art.html` = RAW/브루탈리스트(기존, 고아→허브에 편입). 모노·일렉트릭블루·NO GRID.
  - 002 `y2k.html` = Y2K/웹1.0. 무지개 워드아트·방문자카운터(localStorage)·마퀴·반짝이커서·방명록·WebAudio 8비트 BGM·공사중.
  - 003 `maximal.html` = 맥시멀리즘/과잉. 색·폰트·움직임 과포화 + **스크롤할수록 시끄러워짐**(--lvl 램프 → 채도·이모지비·소음게이지 LEVEL 0→4). 바닥엔 정적 대비 "숨 쉬세요".
- **연결:** 메인 `index.html` 푸터 Menu 에 "낙서장 ✎" 링크(전환 네비는 안 건드림, 발견 가능한 자리). 각 실험작·허브에 "실제 사이트로" 역링크.
- **모션 정책:** 실험작들은 reduce 무시하고 항상 애니메이션(마퀴=native, 이모지비=rAF). 오너 결정과 일치.
- ⚠️ 실험작 검증은 자동화 히든탭 한계로 애니메이션 시각확인 불가(rAF 0프레임·programmatic scroll 이벤트 미발화) → 로직만 검증(스크롤 이벤트 강제 디스패치 시 램프 정상). 다올 실기기 확인 권장.


## 2026-07-19 (2) — 동작 줄이기 강제 무시 + 앵커 rAF 부드러운 스크롤 (오너 결정)
- **배경:** 오너 결정 — 국내 대상, 모션이 페이드·호버 정도로 과격하지 않아 `prefers-reduced-motion` 을 **무시하고 전 효과 강제 출력**. (접근성 트레이드오프는 고지함: reduce 는 전정기관 장애인 배려 설정이나 자기 포트폴리오+약한 모션이라 감수.)
- **CSS:** `@media (prefers-reduced-motion:reduce)` 블록 **전체 제거**(전엔 `*{transition:none!important}` + `.rv{opacity:1}` 로 모션을 죽였음). 콘텐츠 가시성 안전망은 **`<noscript>` 폴백**(`.rv{opacity:1}`)으로 대체 → 무JS에서도 항상 보임(이전보다 견고).
- **JS:** `var reduce=matchMedia(...).matches` → **`var reduce=false`** 하드코딩. IO 미지원 구형 브라우저 안전망 + 1.6s 세이프티는 유지.
- **✅ 검증(자동화 reduce=true 환경이 오히려 완벽한 테스트):** 카드 이미지 호버 transition `0s→1.05s cubic-bezier`, 네비 밑줄 `0.28s` 부활, reduce 미디어룰 0건.
- **앵커 스크롤:** 네이티브 `scroll-behavior:smooth` 는 reduce 켜지면 브라우저가 즉시점프로 강제 → **rAF 커스텀 스크롤 추가**(seq 소유권 토큰으로 재진입 방지, easeInOutCubic 680ms, 헤더 오프셋=hdr높이+8, per-frame `scrollTo instant` 로 CSS smooth 충돌 차단, **백그라운드탭 프레임0 대비 setTimeout(DUR+300) 즉시이동 가드**). 대상 앵커 = `#top/#work/#value/#process/#price/#contact`.
  - ✅ 로직 검증: `preventDefault=true`(네이티브 점프 차단), 도착=목표(헤더 오프셋 정확), 해시 갱신.
  - ⚠️ **애니메이션 시각 검증 불가** — 자동화 탭 `visibilityState:hidden` → rAF 0프레임 → 가드가 즉시이동(히든탭 폴백). 실기기 보이는 탭에서만 부드럽게 재생. 다올 실기기 확인 필요(동작 줄이기 켠 채 메뉴 클릭 → 미끄러지듯 이동).


## 2026-07-19 — '실제 제작 사례' 섹션 신설 (#case) — 첫 실납품 사회적 증거
- **배경:** 썸머힐디저트가 이피웹의 **첫 실제 납품·인계 사례**(사장님 후기+사례노출 동의 완료). 샘플(=능력 증명)과 **종류가 다른 신뢰 증명**이라 샘플 갤러리에 섞지 않고 별도 밴드로 분리(다올 결정).
- **위치:** `#work`(샘플 16종) **바로 뒤, `#value` 앞**. "만들 수 있다 → 실제로 납품했다 → 왜 이피웹인가" 신뢰 상승 순서.
- **디자인:** n=1 이라 번호 섹션 대신 **paper-2 틴트 밴드 + featured 카드 1개**(사례 늘면 정식 섹션 승격). 카드 = 실제 납품 사이트 대표 이미지(딸기 타르트, `case-summerhill.webp` = 라이브 sh-c1 self-host) + "실제 납품 완료" 배지 + 라이브 링크 버튼. **증거의 핵심 = 클릭하면 열리는 실제 운영 사이트**(www.summerhilldessert.workers.dev) — 후기 문구보다 강한 증거(후기는 지어낼 수 있어도 작동하는 실고객 사이트는 못 지어냄).
- **후기 인용:** 사장님 인스타 실제 후기 텍스트는 **미포함**(지어내지 않음). `.cc-quote` 스타일만 대기, 다올이 실제 문구 주면 verbatim 삽입 예정.
- **추적:** `section_view` IO 배열에 `'case'` 추가 → 방문자가 실사례 밴드까지 도달하는지 깔때기 측정 가능.
- ⚠️ 카드 이미지는 self-host(내 도메인) — 고객 사이트 다운돼도 내 포트폴리오 이미지는 안 깨짐. 단 라이브 링크 버튼은 고객 사이트 가동에 의존(고객이 내리면 링크만 죽음, 감수).

## 2026-07-18 — 인스타 DM CTA를 프로필 링크 → **DM 딥링크**로 교체 (깔때기 마지막 문 수리)
- **문제:** "DM 신청"이라 적힌 CTA 3곳이 전부 `https://instagram.com/your.page_yp`(=**프로필**)로 가고 있었다. 누른 사람이 DM 작성창이 아니라 프로필에 떨어져 **직접 메시지 버튼을 찾아 눌러야 하는 한 홉**이 더 있었다. 바이오 링크가 링크트리 → 이 사이트로 바뀐 뒤(7/16) 이 팝업이 **깔때기의 마지막 문**이 되었기 때문에 손실 지점이었다.
- **수정:** 3곳 전부 `https://ig.me/m/your.page_yp` 로 교체 (딥링크 = 클릭 시 DM 창 즉시 열림, 다올이 실기기에서 동작 확인 완료).
  - L553 문의 섹션 `.cta-alt` "인스타 DM"
  - L577 하단 채널 "Instagram DM →"
  - L596 **런치 이벤트 팝업 "인스타 DM 신청"** `.btn-primary` ← 핵심
- **추적:** L596은 `class="btn btn-primary"` 라 기존 `click_cta` 이벤트가 이미 붙어 있음. → 7/17 시점 `popup_shown` 2 / `click_cta` 0 은 **추적 누락이 아니라 실제 미클릭**이었음이 확인됨(테스트 방문 2건 모두 팝업만 뜨고 버튼은 안 누름).
- **측정:** 이후 `click_cta` 가 잡히기 시작하면 "팝업 노출 → 신청 클릭" 전환을 처음으로 잴 수 있다. 지금 깔때기 기준선 = 프로필 방문 158 → 외부링크 누름 9 (**5.7%**).
- 백업: `/tmp/yipiweb_backup.html` (세션 한정). 배포는 다올이 커밋 후 Cloudflare 확인.


## 2026-07-16 (4) — 🔴 진짜 원인 규명·수정 완료: **파라미터 이름 `sid` 를 구글이 차단**
- **두 세션짜리 '비콘 미적립' 미스터리 종결. Apps Script 코드·배포·토큰·계정 전부 처음부터 정상이었다.**
- **실측:** 실제 비콘형 랜덤 sid → `sid=` **0/6 성공** / `yw_sid=`(같은 값, 이름만 변경) **6/6 성공**. FAIL 시 `hit_count` **불변**(45→45) = **doPost 미도달**, 응답 본문은 Apps Script 것이 아니라 **Google Docs 에러 HTML** → **구글 프론트가 실행 전에 자른다.** `sid=abc` 는 통과해서 오랫동안 '산발적 실패'로 보였다.
- **설계 §10-3 의 "sid 가설 반증"이 오판이었다** — 존재 여부만 보고 **값을 안 봤다.** 그 표의 모순(E_WITH_SID 성공/D_ENVHALF 실패)이 사실 **값 의존의 증거**였는데 모순으로 읽고 접었다. §10-0 의 "doGet 도달·doPost 0회"도 이걸로 완전히 설명됨(진짜 비콘은 항상 랜덤 sid → 100% 차단).
- **수정:** ① **Worker 가 upstream 전달 직전 `sid` → `yw_sid` 개명**(브라우저→Worker 는 CF라 무해, 문제는 Worker→구글 구간뿐 → **라이브 index.html 을 안 고쳐도 즉시 수집이 산다.** 이미 yw_sid 면 no-op) ② **`analytics-appsscript.gs` 가 'sid' 컬럼을 `p.yw_sid` 에서 읽음**(폴백 `p.sid` 유지, 시트 스키마 불변).
- **✅ 검증:** 수정 전 0/6 이던 body → **5/5 `OK 302`**. **진짜 비콘 실방문 → `last_ok = page_view`, hit_count 50→51, sheet_rows 51→52** — 비콘이 시트에 적힌 **최초** 기록.
- **✅ Apps Script 재배포 완료**(16:3x) — `sid=MARKER-7788` 표식이 시트 `sid` 컬럼에 찍힘 확인 = 새 `.gs` 서빙 중. 시트 테스트 행도 정리됨.
  - ⚠️ 배포 유형 함정: **"새 배포"는 URL이 바뀌고**(Worker UPSTREAM 도 같이 고쳐야 함), **"라이브러리 배포"(`/macros/library/d/…`)는 doPost 를 안 받는다.** 둘 다 한 번씩 잘못 골랐다. 정답 = **배포 관리 → 연필 → 버전: 새 버전**(웹 앱 / 실행=나 / 액세스=모든 사용자, URL `AKfycbz3…` 고정).
  - ⚠️ 로그인된 브라우저에서 새 `/exec` 를 열면 `/macros/u/1/s/…` 로 라우팅되며 **404** 가 뜨는데 **이건 증거가 아니다**(§10-3 트랩 재확인).
- **✅✅ 전 구간 검증 완료 — 수집 가동.** 시크릿창 실방문+스크롤+샘플클릭 → **`page_view`·`section_view`·`click_*` 전부 시트 적립 확인, `ts` 정상**(-16h 재발 없음 → §10-0b·§10-6-2 도 종결). **§10 전체 종결.**
- **빈 셀은 설계상 정상**(다시 파지 말 것): `scroll_max`·`secs`=`exit` 에만 / `utm_*`=UTM 파라미터 있을 때만 / `referrer`=경유 방문만 / `inapp`=인앱 브라우저만 / `value`·`detail`=이벤트별. **비면 진짜 문제인 건** `ts`·`event`·`page`·`sid`·`device`·`os`·`browser`·`viewport`·`lang`. **`exit` 만 없는 것도 버그 아님**(sendBeacon 불투명, §10-9a).
- ⚠️ `index.html` 로컬(`yw_sid`) ≠ 라이브(`sid`) — **Worker 개명 덕에 양쪽 다 정상 동작**(no-op). 다음 커밋 때 자연히 맞춰짐.
- ⚠️ **새 함정: 업로드 도구가 파일명 기준 캐시.** 같은 세션에서 `index.html` 재업로드 시 **첫 업로드 바이트가 재전송**돼 **"0 file changed" 빈 커밋**이 생긴다. 커밋 목록엔 메시지가 멀쩡히 보여 **"커밋됐다"고 오판**(이번에 2회). **판정법: 커밋 후 `raw` 로 실제 바이트 확인.** 우회: 다른 파일명으로 업로드.
- `index.html` 로컬은 `yw_sid` 로 보내도록 수정됨(**미커밋** — Worker 개명 덕에 불필요, 나중에 올려도 no-op).


## 2026-07-16 (3) — ✅ Worker 라이브 확인 + 비콘 EP 교체 커밋 (수집 파이프라인 연결 완료)
- **⚠️ 이 세션의 전제(“302 수정본이 커밋에 안 담겼다”)는 사실이 아니었다 — 실측으로 반증.** 레포 `Daorl8/Daorl8-yw-collect` 의 `index.js` = **170줄(=로컬과 동일)**, `redirect:'manual'` + `r.status===302` 성공 처리 + `/probe` 라우트 **전부 포함**. 로컬도 169줄이며 189줄인 파일은 존재하지 않는다. → **재업로드 안 함**(불필요).
  - 혼선 원인 추정: 레포명이 `yw-collect` 가 아니라 **`Daorl8-yw-collect`**(CF 프로젝트명 `daorl8-yw-collect` 와 맞춤). 다른 곳을 봤을 가능성. **문서 곳곳의 `yw-collect` 표기를 실제 이름으로 정정**(아래 STRUCTURE·설계 §10 반영).
- **라이브 실측(추론 아님, §10-8):**
  - `GET /health` → `yw-collect ok`
  - `GET /probe?d=…` → upstream **첫 응답 302 + Location=googleusercontent/echo** (= doPost 실행 완료 신호)
  - **`POST /` (yipiweb 오리진에서 한글 body) → `status=200, body="OK 302"`** ← **302 수정본이 이미 라이브라는 직접 증거**
  - `GET /debug?d=…` → `hit_count 3→4`, `sheet_rows 3→4`, `last_ok = LIVECHECK_302`, `last_error = -` → **브라우저 → Worker → Apps Script → 시트 전 구간 관통 확인.**
  - ⚠️ `/debug` 는 캐시를 탄다 — **`&cb=<난수>` 를 붙이지 않으면 옛 카운터를 보고 “안 올랐다”고 오판한다**(이번에 실제로 한 번 속았음).
- **`index.html` 비콘 EP 교체 커밋** — `https://yw-collect.lgt3232.workers.dev/`(**존재하지 않는 주소였음**) → **`https://daorl8-yw-collect.lgt3232.workers.dev/`**. 라이브 재확인: `var EP` = 새 주소, 비콘 `no-cors` 없음, 934줄·`</html>` 정상(잘림 0).
  - 순서 준수(§10-9): Worker 배포 확인 **먼저**, index.html 커밋 **나중**. ✅
- **⚠️ 남은 검증 1건 = 다올 몫: 시크릿창 또는 폰(셀룰러) 실방문 → 시트 `events` 행.** 이 브라우저로는 **원리적으로 검증 불가** — `localStorage.yw_admin='1'` 이 걸려 있어(설계 §10-9c) 비콘이 **정상적으로** 조기 return 한다. 실제로 이번에도 “실방문했는데 hit_count 안 오름”이 나왔으나 **버그가 아니라 admin 제외가 작동한 것**. 이 함정에 두 세션 연속 걸렸다 → **admin=1 브라우저는 검증에 쓰지 않는다**(원칙: 검증=시크릿창 / admin=1=평소 브라우저).
- ⚠️ **정리 필요: `yw-collect/src/index.js`(112줄) 는 죽은 중복본**이다. `wrangler.toml` 의 `main = "index.js"`(루트)만 배포되고 `src/` 는 아무도 안 읽는다. 다음에 이걸 고치면 라이브에 반영이 안 돼 또 헤맨다 → **삭제 권장.**


## 2026-07-16 (2) — 비콘을 CF Worker(`yw-collect`) 경유로 전환 ⚠️ 배포 대기
- **원인 규명 종결 → 구조 전환.** `?debug=` 실측에서 `hit_count`가 시크릿창 실방문 전후 **0으로 불변** = doPost 미도달 = 판정표(설계 §10-5)의 "진짜 전송 문제" → 타임박스대로 원인 추적을 끝내고 **CF Worker 프록시**로 전환(설계 §10-9).
- **신규 `yw-collect/`** (별도 Worker 프로젝트 — ⚠️ **yipiweb 의 `wrangler.toml` 은 손대지 않음**. `[assets] directory="./"` 정적 전용이라 잘 도는 배포에 위험 얹지 않는다): `src/index.js`(프록시) · `wrangler.toml`(`[vars] UPSTREAM` + `[observability] enabled=true`) · `README.md`(배포·검증 절차).
  - 라우트: `POST /`(이벤트 프록시, 응답 `OK 200 | …`) · `GET /health` · `GET /debug?d=<TOKEN>`(Apps Script 카운터 통과).
  - 프록시는 **의도적으로 멍청하다** — 토큰 검증·저장·개인정보 취급 전부 없음. body 그대로 통과.
- **`index.html` 비콘 수정**: `EP` = `https://yw-collect.lgt3232.workers.dev/`, **`mode:'no-cors'` 제거**(일반 CORS fetch), 실패 시 `console.warn('[yw-collect] …')`, sendBeacon 큐 거부도 경고. **문의 폼 스크립트는 미변경**(SCRIPT_URL·no-cors 그대로 — 개인정보 경로는 분리 유지).
- **왜 이게 끝인가**: 오늘 문제의 뿌리는 no-cors = **에러가 안 보인다**였다. Worker 는 CORS 헤더를 우리가 주므로 브라우저가 상태·본문을 그대로 본다 → 장님 디버깅이 **구조적으로 불가능**해짐. 서버사이드 fetch라 구글 계정 라우팅(`/u/N/`)·302 리다이렉트와도 무관.
- **자체 검증**: Worker를 node+fetch 스텁으로 모의 실행 — 프리플라이트 204 / 성공 `OK 200` / 허용외 Origin 403 / Origin 없음 통과 / 빈 body 400 / 8KB↑ 413 / upstream 예외·5xx → 502(메시지 노출) / **한글 body 무손실** / `redirect:'follow'`. 비콘 `node --check` 통과, 비콘 앞 785줄 백업과 동일(잘림 0).
- ⚠️ **다올 몫 (순서 고정)**: ① GitHub `Daorl8/yw-collect` 레포 생성·업로드 → ② CF Workers → Import a repository → 배포(빌드 커맨드 비움) → ③ 시크릿창에서 `/health` = `yw-collect ok` 확인 → ④ **그 다음에** index.html 커밋 → ⑤ **시크릿창/폰(셀룰러) 실방문** 후 시트 `events` 행 확인. **Worker보다 index.html을 먼저 커밋하면 그동안 방문이 유실된다.**
- ⚠️ 검증은 **시크릿창/폰으로만**(§5-8: 로그인 브라우저·자동화 탭 결과는 증거로 쓰지 말 것). 실패 시 진단: `…/debug?d=yw_a8f3k1qz` 의 `hit_count` ↑면 Apps Script 내부(`last_error` 확인), 정지면 CF 대시보드 → yw-collect → **Logs**(익명 요청도 남음).

## 2026-07-16 — 인사이트 수집 3층 켜기 (커밋 08af24b, 1커밋)
- **CF Web Analytics 스니펫**(토큰 a70241e8…) 삽입 — 쿠키 없는 방문·레퍼러·기기 베이스라인.
- **이벤트 비콘 활성화** — `EP`=gmail(lgt31311@) Apps Script `/exec`(AKfycbz3…), `K`=TOKEN. 수집: page_view·section_view·click_work/cta/channel·form_submit·popup·exit(scroll_max·secs). 익명 집계만, 쿠키 0(sessionStorage sid), `?admin=1` 자기방문 제외.
- **크로스환경 방어**: `<meta name="color-scheme">`, `html{-webkit-text-size-adjust:100%;color-scheme:light}`, `@media(hover:none)` 호버 transform 리셋. (DESIGN_CHECKLIST §12)
- 설계·스키마·UTM 규칙·함정 = `문서/인사이트_수집_설계.md`. 수집 스크립트 원본 = `yipiweb/analytics-appsscript.gs`.
- ⚠️ **미해결: 비콘 `page_view` 3회 연속 미적립**(수동 fetch 7건은 적립됨, 산발적 실패). + `ts` -16h(PDT) 원인 미상. **다음 세션 실행 스펙 = `문서/인사이트_수집_설계.md` §10**(반증된 가설표 · PropertiesService 카운터+`?debug=` 진단 · 판정표 · 타임박스 1h30m 초과 시 무조건 CF Worker 프록시). CF Web Analytics는 정상 가동이라 급하지 않음.
- ⚠️ **엔드포인트 디버깅에 크게 헤맴 — 교훈 4개를 설계 문서 §5에 기록.** 요약: (1) **로그인된 브라우저로는 `/exec` 검증 불가** — 계정 2개면 `/u/N/` 라우팅 때문에 같은 URL이 GET은 ok, POST는 404. 시크릿창에선 정상. 이 404들을 근거로 "배포가 깨졌다"고 2번 오판함. (2) **실행(Executions) 로그 0건은 아무것도 증명 못 함** — 익명 웹앱 실행은 안 남음. (3) **코드 저장 ≠ 배포** — 버전 안 올리면 옛 코드 서빙(실제로 토큰 빈 버전이 돌고 있었음). (4) `/a/macros/{도메인}/s/…`는 잘못된 URL이 아니라 표시용 접두사.

## 2026-07-13 — art.html 마퀴 구동 + index.html 가격 정렬 수정
- **art.html 마퀴(띠) 안 돎 → setInterval 구동으로 전환**. CSS `animation:marq`가 감소된 모션(자동화/사용자 설정)에서 얼어 정지 → 프로젝트 표준대로 JS setInterval transform(트랙 폭 절반 단위로 무한 랩)로 교체, reduced-motion에서도 회전. `@keyframes marq`·reduced-motion animation:none 제거.
- **index.html 가격 정렬 어긋남 수정**: `.price-card` 그리드 `1.1fr .9fr auto` → **`1.1fr .7fr 1.5fr`**(+ 자식 min-width:0). 세 번째(기능설명) 열이 `auto`라 행마다 텍스트 길이로 열폭이 바뀌어 가운데 가격 열 시작 x가 어긋남(9.9/18/32만원 좌우 불일치) → 고정 fr로 전 행 정렬 통일.

## 2026-07-13 — art.html 폰트·블루 조정 (가독성)
- 디스플레이 폰트 **Black Han Sans → Do Hyeon**(옛 간판체 기반). Black Han Sans가 초대형에서 획 뭉개져 판독 불가 → Do Hyeon은 개성 유지하면서 큰 글씨서도 또렷(다올: 프리텐다드/정형 산세리프는 배제). `--han`/`--disp` 교체, Latin도 Do Hyeon 우선(GOYO 등 인덱스 타이틀 통일).
- 악센트 블루 **#0000FF → #2E38C8**(채도↓). 순블루가 "블루스크린" 느낌 → 인디고 쪽으로 살짝, 톤 다운. 라이브 렌더로 가독성·톤 확인 후 배포.

## 2026-07-13 — art.html 신규: RAW EDITION (브루탈리스트 아트 에디션)
- **별도 페이지 `art.html`** 추가(라이브 `/art.html`). 본 사이트(index.html)와 분리 — 바이오 링크·전환율 무영향. 목적: "팔 생각 없이, 만들고 싶은 대로" 만든 예술 실험작(사용성 최소·예술 최대). 강화 생성 프로토콜로 진행.
- **① 레퍼 실측**: brutalistwebsites.com getComputedStyle → 토큰 = 배경 #EEEEEE · 잉크 #000 · 악센트 #0000FF(일렉트릭 블루, 색 3개뿐) · 디스플레이 대문자 sans 초대형 tight · 본문 monospace · 플랫(라운드·그림자·그라데이션 0). 1:1 복제 금지 각색.
- **각색**: 이피웹 "RAW EDITION" 선언 페이지. 초대형 한글 블랙타이포(Black Han Sans CDN, 시스템 대비 발산) + monospace 매니페스토(3px 테두리 박스) + 블루 마퀴 + 16작업물 raw 인덱스(호버 색반전, 실제 샘플로 링크) + 커서 반응 블루블록(mix-blend-difference lerp) + 모노 시계. 기존 모노+딥블루+Mukta 시스템 **미재사용**(컨텍스트 오염 차단).
- **검증(배포 전)**: base64 data로 라이브 렌더 → 데스크톱·모바일(최소 501px, 오버플로우 0) 스샷 확인. reduced-motion 시 마퀴·커서블록 정지.
- ⚠️ index.html은 그대로. .assetsignore가 CHANGELOG·습작 index_* 제외하므로 art.html만 신규 서빙.

## 2026-07-13 — 문구 수정 + 문장단위 줄바꿈 (11곳, 1커밋)
- 히어로 리드 / 왜이피웹 3항목 / 프로세스 02·03·05 / 가격 베이직·스탠다드 pwho / CTA 폼 리드 / 푸터 브랜드 문구를 다올 새 카피로 교체. 표시한 줄바꿈 지점에 `<br>`(문장 단위)로 PC·모바일 공통 반영. (내용 변경: 왜이피웹 i "3년…" 문장 삭제, ii/iii 리라이트, 프로세스03 "선결제 없음" 삭제·"별로면"→"마음에 들지 않으면" 등)
- ⚠️ 배포: 11개를 **1커밋으로 묶음**(큐 부담↓). 모바일에서 `<br>` 문장 줄바꿈이 어색하면 PC 전용 `<br>`(미디어쿼리)로 전환 검토.
- ⚠️**실제 원인(중요)**: 첫 문구 커밋이 GitHub main에 **실제로 안 올라감**(JS requestSubmit이 'submitted' 반환했지만 폼 제출 미완료 — 아마 메시지필드 조작 영향). CF엔 그 버전이 아예 없어서 미배포. → **재커밋(단순 제출)로 해결, main·라이브 확인 완료.** 교훈: 브라우저 커밋 후 **commits/main에서 실제 반영 여부 확인** 필수(‘submitted’는 증거 아님). raw.githubusercontent는 CDN staleness로 신뢰 불가 → 라이브 workers.dev를 JS로 검증.
- 히어로 스크림을 **전체 흰 필터 → 중앙 방사형(radial) 스포트라이트**로 변경(`radial-gradient(ellipse 60% 82% at 50% 46%, .85→0)`). 중앙 텍스트는 밝게, 가장자리(글자 없는 여백)는 배경 사진 노출. 모든 텍스트가 밝은 코어 안에 있어 배경 사진이 밝든 어둡든 가독성 유지. (다올 요청, 라이브로 보고 판단 — 유지 여부 미확정)
- 하단 **스탯 라벨** 옅은 구간 가독성 저하 → 색 #7C7C82→**#353535 + weight 500**. 커밋 2건→1건으로 묶어 배포 큐 부담 감소.

## 2026-07-13 — 이벤트 팝업 애니메이션 + Gift 카드 리디자인
- 이벤트 팝업(evtModal) & 성공 팝업(okModal) **열기=밑에서 떠오름(cardIn) / 닫기=밑으로 내려가며 사라짐(cardOut)** + 백드롭 페이드. 공용 `closeModal`(`.closing` 클래스→setTimeout 330ms 후 hidden, reduced-motion 폴백). 애니메이션은 CSS(실사용자용), 기능(닫힘)은 setTimeout으로 보장.
- 하단 **Gift 박스 → 딥블루 그라디언트 카드**로 리디자인(라운드18·그림자·코너 글로우·태그없이 `.event-main`/`.event-cond` 계층). "PPT 박스" 탈피.
- ⚠️ **버그 발견·수정**: `.event-main`/`.event-cond`가 `.cta p`(색 #353535)보다 우선순위 낮아 카드 본문이 어두웠음 → 선택자를 `.event .event-main` 등으로 승격(흰색). **로컬·main 커밋 반영 확인**.
- ⚠️ **배포 지연**: 오늘 커밋 다수 연속 → CF Workers 빌드 큐 밀림/정체로 라이브가 몇 커밋 뒤처짐(색 수정 미반영 상태로 관찰됨). 재커밋 자제(큐 악화 방지). **확인법**: CF 대시보드 → Workers & Pages → yipiweb → Deployments/Builds 탭에서 빌드 대기/실패 여부 확인(실패 빌드가 뒤 커밋 차단 가능 → 재시도). 배포되면 Gift 본문 흰색·팝업 애니 정상.
- 메모 정정: 앞선 엔트리들 날짜 "2026-07-11"은 실제 **2026-07-13** 오기(env 기준).
- **해결**: 큐 소진 후(다올이 "16 min ago" 확인) **깨끗한 재커밋 1회**로 색 수정 배포 완료 — 라이브 Gift 본문 흰색(rgb255)·조건 #A7B6CD 확인. 팝업 cardIn/cardOut도 라이브 반영.


## 2026-07-11 — v4 문의 폼(구글 앱스 스크립트 연동)
- CTA(#contact)에 **문의 폼 섹션** 추가: 가게명/이름 · 연락받을 이메일 · 문의 내용 · **개인정보 수집·이용 동의 체크 1줄**(route ⓐ). 하단에 보조 채널(인스타 DM · 이메일 복사) 한 줄.
- 백엔드 = **구글 앱스 스크립트 웹앱**(다올 시트 계정에서 실행) → 제출 시 **구글 시트(문의 탭) 한 줄 적립 + lgt31311@gmail.com 메일 알림**(replyTo=손님 이메일). 제3자 SaaS·추가가입 0. fetch no-cors(fire-and-forget)+낙관적 성공표시. ⚠️ Apps Script 콜드스타트로 첫 제출 "보내는 중…" 8~10초(이후 빠름).
- 시트/메일 계정이 달라도 무관(스크립트=시트계정 실행, 알림 to=lgt31311). 학교계정은 손님 비노출(방문자 대상 자동회신 안 보냄).
- 라이브 테스트 제출 성공 확인(시트 행+메일은 다올이 확인 후 테스트행 삭제). 스크립트 코드/배포법은 대화 및 [[yipiweb-deploy-setup]] 참조.
- 근거(폼백엔드 조사·개인정보): CHANGELOG 대화 로그 참조.
- (2차) 성공 메시지 = **인라인→성공 팝업 모달**(체크 ✓·"문의가 접수됐어요"·확인/X/Esc/스크림). 제출 중 버튼에 **JS 회전 스피너 + "보내는 중…"**(reduced-motion에서도 안 멈추게 setInterval). 인라인 상태문구는 오류 표시용으로만. 라이브 검증 완료(스피너·팝업 확인). 메일 첫 테스트가 스팸함 → 발송 자체는 정상.


## 2026-07-11 — v3 피드백 2차 (라이브 배포·검증)
- **팝업 버튼 2줄 정렬**: "인스타 / DM 신청", "이메일 / 신청"(br). modal-actions 중앙정렬.
- **히어로 배경 = JS 크로스페이드**로 전환. ⚠️ 자동화/reduced-motion 브라우저가 CSS 애니메이션·rAF를 얼려 "안 바뀜" 발생 → **setInterval 구동**(5s 전환)으로 무조건 회전. 필터 옅게(grayscale .32→.15, scrim .72→.62), opacity .6→.9로 사진 잘 보이게. JS로 회전 검증(active 2→4).
- **캐러셀 마우스 스크롤바**(#wbar 드래그) 추가 + 자동스크롤도 **setInterval 전환**(rAF throttle 회피, 느린 속도). 검증: scrollLeft 이동 확인. 전 16종.
- **왜 이피웹 카피**: 매달0원→"유지비는 없습니다.", 100%소유→"100% 사장님 소유입니다.", 할일없음→"맡기고 본업에 집중하세요." h3 크기 축소+text-wrap:balance(줄넘침 방지). 요약태그는 이미 v2에서 제거됨.
- **하이픈(—) → 온점(.)** 전역 교체(히어로/밸류/프로세스/가격). 숫자범위 3–5일→3~5일.
- **수정 회차 재배치**: 수정 2~3회 = **무료 시안 단계(02)**로 이동(결제 전). 결제 후 모든 수정=30일 무료 AS(05). 가격카드 "무료 시안 수정 N회"로. price-note에서 '한정가' 줄 삭제.
- **이메일**: mailto가 안 열리는 환경 대비 **복사 버튼**(navigator.clipboard) 추가. ※ 실동작 문의 폼(Formspree)은 다올 엔드포인트 필요 — 추후 옵션.


## 2026-07-11 — v2 대규모 수정 (다올 피드백 반영, 라이브 배포)
- **작업물 = 전 샘플 16종 가로 자동 캐러셀.** 기존 9종 그리드 → 16종(고요·플뢰르·눈·녹턴·캥즈·하루치·온집·베슬·결·네일아뜰리에·베르뒤르(필라)·라운드(소셜)·여백(포트폴리오)·정상학원·소곤소곤·포근펫) 가로 스크롤. JS rAF 자동스크롤(트랙 복제로 무한루프)+hover/touch/wheel 일시정지+수동 스와이프, reduced-motion 시 수동만.
- **히어로 은은한 배경.** 샘플 사진 5장(stay·interior·flower·gyeol·pilates) 슬로우 크로스페이드+가로 드리프트, 흰 스크림(.72~.86)으로 텍스트 가독 유지. reduced-motion 시 정지 이미지 1장(op.14).
- **이벤트 팝업(첫 방문).** 선착순 3팀 무료 → 모달(닫기·Esc·스크림클릭·"오늘 하루 안 보기" localStorage). 하단 Gift 박스는 유지(요청). 다른 곳 이벤트 문구 없음.
- **문의 채널.** CTA에 이메일 버튼(mailto:lgt31311@gmail.com) 추가+DM 유지, 푸터에 이메일 노출. CTA 카피에서 인스타 전용 "시안 한마디" 문구 제거→"지금 바로 문의" 톤. 내비 버튼 "문의하기"(흰 글씨+패딩 여유, #contact 앵커).
- **정리.** value 요약태그 3개 제거(AI 티), "왜 이피웹인가" em 간격, 가격 헤딩 "처음 한 번만" 제거, 프로세스 04/05에 수정 2~3회 vs 30일 AS(하자보수) 구분 명시, 전역 word-break:keep-all(단어 안 끊김), 통계 16종+.
- 커밋→CF 자동배포→라이브 검증 통과(팝업·히어로 배경·캐러셀·16종·이메일·문의버튼 확인). index_mono.html 동기화.


## 2026-07-11 — index_mono.html 신규 (강화 생성 프로토콜 · studioddang 레퍼)
- 레퍼: https://studioddang.com/about.html (호리존 렌탈스튜디오, GA09 DESIGN). Chrome getComputedStyle로 실측.
  - 실측 토큰: 배경 #FFFFFF, 본문 #353535, 헤드라인 #000, **악센트 0(완전 모노크롬)**, 영문 Mukta Malar 200~300(ls 1px)+한글 Nanum Gothic, EB Garamond, 대괄호 아이브로우 `[ ABOUT STUDIO ]`, 중앙축 갤러리 호흡, 5열 에디토리얼 푸터, 12~15px 소형.
- 다올 승인 방향(구조 3안·스타일 3안 선택): **A. 갤러리-퍼스트** + **모노크롬 베이스 + 딥블루 #1F3A5F 악센트 1개**.
- 각색(1:1 복제 아님): 순백 캔버스 위 갤러리-퍼스트. 히어로(대괄호 아이브로우+볼드 한글 헤드라인+얇은 Mukta Malar 영문 서브+통계 4) → **01 작업물 갤러리(실제 샘플 9종 썸네일, 4:3, 호버 시 컬러↑·줌·"사이트 보기")** → 02 왜 이피웹(다크 #0E0F12, 3열) → 03 진행(5스텝, EB Garamond 인덱스) → 04 가격(3티어 행분할, 스탠다드 추천) → CTA(무료 3팀) → 5열→3열 에디토리얼 푸터.
  - **v1과의 차별**: v1=쿨페이퍼#F4F4F1+Fraunces세리프+타이포카드. mono=순백#FFF+Mukta Malar(얇은 레터스페이스 영문)+EB Garamond+**실제 샘플 이미지 갤러리**. 자기복제 아님.
  - 폰트: Mukta Malar(영문 디스플레이·라벨)+EB Garamond(인덱스·이탤릭)+Pretendard(한글 본문, 얇은 웨이트 지양). CDN, 폴백 산세리프.
  - 샘플 썸네일: 각 라이브 샘플의 og:image(자체 self-host photo-*.jpg)를 hotlink(내 workers.dev 자산이라 안정적).
- a11y/모바일: `.rv` reduced-motion 폴백+1.6s 세이프티, :focus-visible, aria-expanded 메뉴, backdrop-filter 미사용(불투명 헤더), 100svh 불필요(풀스크린 히어로 없음), 호버효과는 `@media(hover:hover)`로 터치 제외.
- 정적 교정: 웜 흐름 중성색(#F6F6F4·#E7E7E3)→완전 중성(#F6F6F6·#E7E7E7), --ink-faint #9A9A9F→#7C7C82(흰 배경 AA 대비 확보).
- ⚠️ 검증 렌더: 샌드박스 헤드리스(브라우저 다운로드 차단)·Chrome navigate(file:// 미지원)·base64 수기편집(유니코드 혼입) 모두 실패 → **픽셀 스샷-diff는 배포 후 수행 예정**. 코드/토큰/구조/대비는 정적 검증 통과.
- 상태: **index.html로 승격됨**(2026-07-11, 다올 "이대로 가자"). 기존 v1은 `index_v1_paper.html`로 백업. index_mono.html도 동일 사본 유지.
- **배포 세팅(2026-07-11):** 기존엔 GitHub 없이 `wrangler deploy`로만 배포돼 있었음(레포 부재 확인). 다올 요청으로 샘플과 동일한 **git-connect 패턴으로 전환**: `Daorl8/yipiweb` 레포 신규 생성(Public) + `index.html·wrangler.toml·.assetsignore·og.jpg` 커밋(main). `.assetsignore`에 습작 index_* 추가(공개 제외). 핸들 `your.page_yp` 다올 확인 완료(정확함). CF에서 레포 Connect to Git → 최초 deploy **완료(2026-07-11)**. 라이브 렌더 검증 통과(히어로 대괄호 아이브로우+EB Garamond 강조, 갤러리 9종 호버 컬러, 다크 밸류 섹션 정상). **이후 Daorl8/yipiweb 커밋=자동배포.**
- 미해결: ① **히어로 "킥"(임팩트) 부족** — 다음 수정 때 보강 예정. ② **인스타 핸들 `@your.page_yp` 미확정**(전 CTA 하드코딩) — 배포 전 교체 필수.

## 2026-07-10 — v1 최초 제작
- 이피웹(YIPI WEB) 자체 홈페이지 신규 제작. 목적: ① "링크트리 탈출" 모순 해소 ② 최고의 단일 포트폴리오 ③ 문의 전환 표면(링크트리 대체 허브).
- 디자인 방향: **미니멀 에디토리얼**(사용자 선택). 샘플들의 beige·세리프 수렴에서 의도적으로 벗어남.
  - 팔레트: 쿨 페이퍼 #F4F4F1 + 잉크 #16181C + 딥블루 악센트 #1F3A5F (모노+단일 악센트).
  - 폰트: Pretendard(본문) + Fraunces 이탤릭(영문 에디토리얼 악센트·섹션 인덱스).
  - 모티프: 섹션 인덱스 번호(01~04), 헤어라인, 비대칭 그리드, 절제된 스크롤리빌.
- 섹션: 히어로 → 01 차별점(다크) → 02 작업물(라이브 샘플 9종 링크아웃) → 03 진행 방법(완성본 먼저 플로우) → 04 가격(3티어) → 문의 CTA(무료 3팀) → 푸터.
- 단일 파일 HTML(인라인 CSS/JS). 이미지 의존 없음(자체 OG 이미지 og.jpg만 self-host, 1200×630 Pillow 생성).
- a11y: 메뉴 aria-expanded, :focus-visible, prefers-reduced-motion, 스크롤리빌 폴백(IO 미지원·hidden-tab 대비 1.6s 세이프티).
- CTA 채널: 인스타 DM(@your.page_yp) — ⚠️ 핸들 최종 확인 필요.

### 배포 대기 (사용자 단계)
- GitHub Daorl8/yipiweb 업로드 → Cloudflare 연결 → yipiweb.lgt3232.workers.dev.
- 이후 인스타 바이오 첫 링크를 이 사이트로 교체(링크트리는 보조/흡수).

### TODO / 확인 필요
- [ ] 인스타 핸들 @your.page_yp 정확한지 확인(현재 5곳 하드코딩).
- [ ] 이메일/카카오 채널 추가할지 결정(현재 DM 단일).
- [ ] (선택) 작업물 카드에 실제 스크린샷 썸네일 삽입 — 현재는 타이포 카드.
