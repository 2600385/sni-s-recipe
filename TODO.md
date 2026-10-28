# 스니의 업무 레시피 · 남은 일

> 새 채팅에서 "업무 레시피 남은 일 뭐였지?"라고 물으면 이 파일을 읽고 알려준다.

## 할 일
- [ ] **툴 주소 채우기** — AX004, '만성' 말고는 아직 "주소 준비 중". 툴 주머니에서 툴 → 연필(고치기)로 넣거나, 이름·주소 목록을 주면 일괄 등록.
- [ ] **레시피 노트 링크** — 보고서·발표자료에 사내 드라이브 링크를 넣어야 "열기"가 됨.
- [ ] **예전 주소 정리 (급하지 않음)** — 지금 쓰는 주소는 https://sni-recipe.vercel.app 하나.
  - Netlify `sni-tool` (sni-tool.netlify.app, 옛 버전): Netlify 대시보드 → Project configuration → Delete project
  - GitHub Pages (2600385.github.io/sni-s-recipe): 저장소 Settings → Pages → Branch를 None → Save
  - 이 두 개를 꺼도 코드(GitHub)·데이터(Supabase)·Vercel 사이트에는 영향 없음
  - **지우면 안 되는 것**: GitHub 저장소 `sni-s-recipe`, Supabase 프로젝트 `sni's recipe`, Vercel 프로젝트 `sni-recipe`
- [ ] **옛 창고 정리 (선택)** — 기존 Supabase 계정의 `sni-work-recipe` 프로젝트는 더 이상 안 씀. 원할 때 대시보드에서 삭제.

## 현재 구성
- 자동 접속: GitHub Actions `Keep Supabase awake`가 3일마다 창고에 접속해 일시정지를 막음. 저장소에 60일 넘게 변경이 없으면 GitHub이 이 작업을 멈추니, 메일이 오면 Actions 탭에서 Enable 누르기.
- 주소: https://sni-recipe.vercel.app (main에 올리면 Vercel이 자동 배포)
- 창고: Supabase `sni's recipe` (다있소와 같은 새 계정)
- 레시피 노트 분류: 보고서(신전팀/사무소/사업부) · 발표자료(신전팀/사무소/사업부) · 개인 노트.
- 노트 잠금: 기록마다 "잠금"을 체크하면 링크·파일 경로가 입장 코드로 암호화되어 저장됨. 잠긴 카드는 제목·자물쇠만 보이고, 코드를 한 번 넣으면 레시피를 덮기 전까지 열림. 입장 코드를 바꾸면 잠긴 기록을 먼저 풀어서 다시 잠가야 함.
- 다있소는 별개 툴. 창고·로그인·배포 모두 따로.
