# STRUCTURE — yipiweb (이피웹 전용 사이트)

CF Workers 정적 자산 배포. 라이브 = https://yipiweb.lgt3232.workers.dev
GitHub(백업·이력) = Daorl8/yipiweb → CF 자동배포.

## 페이지 (배포됨)
- `index.html` — 메인. 히어로·차별점(#value)·샘플 갤러리(#work, 17종)·실제 사례(#case, 썸머힐·네일어반)·진행방법(#process)·가격(#price)·문의(#contact, 폼 #cform). 푸터에 낙서장 링크. **인페이지 데모뷰어(#demoViewer, 2026-08-06)**: `a.wcard` 클릭 → 모달 iframe으로 라이브 샘플 렌더 + 데스크톱/모바일 토글·새탭·닫기(ESC/백드롭). **#work 17종 전체 적용**(URL=href·이름=.gname·업종=.gcat 자동 추출, data-demo/name/cat로 override 가능). **`data-no-demo` 붙이면 그 카드는 새 탭 유지**(opt-out). ⚠️실고객은 #case라 자동 제외 — #work엔 실고객 넣지 말 것.
- `nakseo.html` — 낙서장 허브(다크). 실험작 4 타일(`.tile`) → 각 풀페이지.
- `art.html`(001 RAW) · `y2k.html`(002 Y2K) · `maximal.html`(003 과잉) · `premiere.html`(004 시사회) — 낙서장 실험작. **005=라운드**(nakseo 타일 → social-sample 외부링크, 2026-07-20 스왑).
- `tattoo.html`(GARIN TATTOO) — **정식 샘플**(낙서장 005에서 승격, 뱃지 제거). yipiweb 도메인 서브페이지지만 샘플로 취급. Linktree로 노출(다올 관리).
- `lash.html`(살롱 드 란 SALON DE RAN, 속눈썹펌) — **정식 샘플**(2026-07-20 완성·추가). yipiweb 도메인 서브페이지, 이미지 self-host, 비콘 O. 홈페이지 `#work` 17번 카드. Linktree 노출(다올).

## 인사이트 계측 (단일 소스)
- `yw-beacon.js` — **비콘 정본(단일 소스).** 홈페이지 6페이지는 상대경로 `/yw-beacon.js`, **가상 샘플**(stay·flower·cafe·object, 2026-07-20 파일럿)은 절대 URL `https://yipiweb.lgt3232.workers.dev/yw-beacon.js` 로 이 파일을 참조. `page=host+pathname` 로 사이트 구분. ⚠️ 실고객 사이트엔 넣지 않음. 정본 설계 = `문서/인사이트_수집_설계.md` §2·§5·§10.
  - 이벤트: page_view · section_view(`section[id]` 자동) · click_case(#case) · click_lab(.tile) · click_work(workers.dev) · click_channel · click_cta · form_submit · popup_shown/close · exit(scroll_max·secs)
  - 경로: 브라우저 →(CORS fetch)→ CF Worker(daorl8-yw-collect) →(302)→ Apps Script /exec → 시트. 세션 키 = `yw_sid`(‘sid’는 구글이 400 차단).
  - admin=1 → localStorage로 자기 방문 제외. 봇 UA 제외. sid=sessionStorage(탭 단위·쿠키 없음).
- `analytics-appsscript.gs` — Apps Script 웹앱 소스(시트 기록). `yw_sid`→`sid` 컬럼 매핑.

## 폰트 (self-host)
- `NanumPen.woff2` · `Cafe24Round.woff2` — 로컬 서브셋.

## 에셋
- `og.jpg`(OG 이미지) · `case-summerhill.webp` · `case-nailurban.webp`(실사례 카드 2건, self-host)

## 배포 제외 (`.assetsignore`)
- `index_*.html`(초안 v1/v3/v4/v5/v6/analog/mono/paper) · CHANGELOG.md · STRUCTURE.md · wrangler.toml · .git
- ⚠️ `.assetsignore` 없으면 Workers가 .git을 공개 노출.

## 폐기됨
- `editorial.html` — 구 실험 004. premiere.html이 대체. 삭제 완료(2026-07-20).
