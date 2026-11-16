# Notion에서 글을 작성하고 운영에 발행하기

원고는 [Myblog_CMS](https://www.notion.so/27212f7c14b780c29c5bf93c1b59cb2b)의 **발행 관리** 보기에서 관리합니다.

2026-11-16에 남아 있던 기존 Markdown 원고 14편도 모두 옮겼습니다. 공개 글 13편의
주소·날짜·분류·본문을 유지했고, 파발마 원고 1편은 Draft로 유지했습니다.
이전부터 Git에 있던 원본은 `archive/pre-notion/`에 보관하며 빌드에서는 읽지 않습니다.
`archive/pre-notion/mapping.json`에서 원본 파일과 Notion 페이지를 대조할 수 있습니다.
본문에 표시되지 않던 HTML 주석은 Notion의 **작성 메모** 속성으로 옮겼습니다.
작성 메모는 운영 글에 포함되지 않습니다.

## 글 작성과 발행

1. 새 글의 `Status`를 `Draft`로 설정하고 본문과 사진을 작성합니다.
2. `Title`, `Description`, `Date`, `Category`를 채웁니다.
3. `Slug`에 원하는 주소를 입력합니다. 예: `my-new-post` → `/my-new-post/`.
   비워두면 페이지 ID를 이용한 고정 주소가 만들어집니다. 제목을 바꿔도 주소는 유지됩니다.
4. 완성하면 제목 옆의 **발행 요청** 버튼을 한 번 누릅니다. `Status`가 `Published`로 바뀌고
   **발행 요청 시각**에 버튼을 누른 날짜와 시간이 자동으로 기록됩니다. 글을 연 화면에서도 같은 버튼을 쓸 수 있습니다.
5. [GitHub의 발행 실행 결과](https://github.com/ThinKim90/MyBlog/actions/workflows/notion-publish.yml)를 확인합니다.

새 발행 요청을 확인하면 요청 시점에 읽은 본문과 사진을 공개본으로 저장하고,
검사와 Gatsby 빌드가 통과한 뒤 GitHub에 반영합니다. 기존 GitHub→Netlify 연결이 자동 배포를 시작합니다.
요청 후 처리가 끝날 때까지는 원고 편집을 잠시 멈추는 것을 권장합니다.
검사나 사진 다운로드가 실패하면 기존 공개본을 유지하고 실행 결과에 오류를 표시합니다.

같은 글을 수정할 때도 원고를 고친 뒤 **발행 요청** 버튼을 다시 누릅니다.
시각이 같거나 비어 있으면 기존 공개본을 유지하므로 편집 중인 내용이 자동으로 덮어쓰이지 않습니다.
이미 발행한 글의 Slug 변경은 막습니다. 주소 이전과 리다이렉트는 별도로 설정해야 합니다.

공개를 취소하려면 `Status`를 `Draft`로 바꿉니다. 다음 자동 처리에서 공개본이 제외됩니다.
다시 공개하려면 **발행 요청** 버튼을 누릅니다.

버튼은 Notion UI에 설정되어 있습니다. `Edit This page` 동작 하나에서 `Status: Published`와
`발행 요청 시각: Time triggered`를 함께 기록합니다. 날짜나 시간을 직접 입력할 필요는 없습니다.
Notion이 요청 시각을 분 단위로 기록하므로 같은 분에 다시 누르면 별도 요청으로 구분되지 않습니다.

사용하지 않는 `Tags`, `Thumbnail`, `Featured`, `Alt Text`는 두 표 보기와 글 작성 화면에서
숨겼습니다. 속성과 기존 값은 보존되어 있고 필요하면 다시 표시할 수 있습니다.

## 반영 주기

Netlify의 `poll-notion-publication` Scheduled Function이 5분마다 Notion 글의 속성과
GitHub main의 최신 공개본 관리 파일을 비교합니다. 새 발행 요청, 공개 글의 Draft 전환,
휴지통 이동·다른 데이터베이스로 이동이 확인됐을 때만 GitHub 발행 작업을 실행합니다.
원고 본문과 사진은 이 확인 단계에서 다운로드하지 않습니다.

변경이 없으면 Netlify 로그에 `no_changes`를 남기고 끝나므로 Actions 실행 기록과
Git 커밋, 빌드·배포가 생기지 않습니다. GitHub의 별도 cron과 30일 유지용 빈 커밋도
제거했습니다. 수동 Run workflow는 유지합니다.

새 요청이 없으면 의존성 설치와 배포를 건너뜁니다. 이미 대기하거나 실행 중인 발행 작업이 있으면
Netlify는 새 실행을 추가하지 않습니다. 확인 중 API 오류나 권한 오류가 발생해도 실행하지 않고
다음 예약 시점에 다시 확인합니다. 5분 간격 확인에 빌드·배포 시간이 추가되며 대기열에 따라
더 늦어질 수 있습니다. GitHub 실행 제목의 `netlify-schedule`로 Netlify가 호출한 실행을 구분합니다.
즉시 처리하고 싶으면 위 GitHub 페이지의 **Run workflow**로 같은 작업을 실행할 수 있습니다.
변경 저장 후에는 공개 사이트의 `/cms-publication.json`을 확인해 Netlify 반영까지 검증합니다.

이 경로는 Notion Webhook이나 Netlify 관리 토큰 없이 동작합니다. 컴퓨터를 켜둘 필요가 없습니다.
Notion 읽기 키는 GitHub 저장소의 `NOTION_API_KEY` Actions Secret과 Netlify 운영 컨텍스트의
동일한 이름의 비밀 환경 변수에 등록합니다. 별도 Notion 연결의 권한은 읽기만 있으면 됩니다.
키를 교체하면 로컬 `.env.notion`, GitHub Secret, Netlify 운영 환경 변수를 함께 바꿉니다.
브라우저 코드와 Git에는 키를 넣지 않습니다. GitHub 토큰은 GitHub 작업 호출에만 사용하며
Notion API에는 전달하지 않습니다. Notion 키도 Notion API에만 전달합니다.

### Netlify 예약 실행 연결

1. GitHub에서 `MyBlog` 저장소만 선택한 fine-grained personal access token을 발급합니다.
   Repository permissions는 `Actions: Read and write`만 추가합니다. 기본 `Metadata: Read` 외에
   Contents나 Secrets 권한은 추가하지 않습니다. 사용자 요청에 따라 만료는 `No expiration`으로 설정합니다.
2. Netlify `thinblog` 프로젝트의 환경 변수에 `NOTION_PUBLISH_GITHUB_TOKEN`을 등록하고
   `Contains secret values`를 켭니다. 운영(production) 컨텍스트에만 값을 넣고 나머지는 비웁니다.
   현재 무료 요금제는 비밀 값의 세부 범위를 선택할 수 없어 운영의 Builds·Functions·Runtime에서
   접근할 수 있습니다. 범위 선택을 지원하는 요금제에서는 Functions만 선택합니다.
   토큰을 Git이나 본문에 넣지 않습니다.
3. 운영에 재배포해 새 환경 변수를 적용합니다. Functions 화면에서 이 함수의 Scheduled 표시와
   예약 로그를 확인합니다. 배포 미리보기에서는 자동 예약이 실행되지 않습니다.
   변경 사전 확인에는 `NOTION_API_KEY`도 필요합니다. 기존 읽기 전용 키를 같은 운영 전용
   비밀 환경 변수로 등록합니다. Functions 범위 선택이 가능하면 Functions만 지정합니다.
   무료 요금제에서는 운영의 Builds·Functions·Runtime 범위를 사용합니다.
4. 토큰을 폐기하거나 교체할 때는 새 토큰을 같은 환경 변수에 등록하고 다시 배포합니다.
   GitHub 인증이나 호출이 실패하면 함수가 오류를 기록하며, 오류 응답이나 인증 값은 로그에 출력하지 않습니다.

Netlify는 Notion 속성과 공개 GitHub main의 관리 파일을 읽어 새 요청을 확인합니다.
관리 파일은 인증 없이 읽으므로 GitHub 전용 토큰에 Contents 권한을 추가하지 않습니다.
관리 파일은 배포본에 포함된 사본 대신 GitHub main에서 읽어 Netlify 배포 지연으로 같은 요청이
다시 실행되는 것을 막습니다. 공개 URL로 이 예약 함수를 호출할 수는 없습니다.

2026-11-16 운영 검증에서는 08:38(KST)에 누른 발행 요청을 08:40 Netlify 예약 호출이 처리했고,
08:42 운영 반영을 확인했습니다. [실제 자동 실행 기록](https://github.com/ThinKim90/MyBlog/actions/runs/43776059518)에서
원고 1개 반영, 테스트 48개·타입 검사·빌드 통과, GitHub 저장, 운영 버전 확인을 볼 수 있습니다.
이 검증에서 GitHub나 Netlify의 수동 실행은 사용하지 않았습니다.
08:45의 [다음 예약 실행](https://github.com/ThinKim90/MyBlog/actions/runs/43776498416)도 정상 완료됐고,
새 요청이 없어서 설치·가져오기·빌드·배포를 모두 생략했습니다.

위 검증은 모든 확인을 Actions에서 수행하던 초기 구조의 기록입니다. 이후 빈 실행 기록을
줄이기 위해 요청 확인을 Netlify로 옮겼습니다. 현재는 GitHub 예약 실행을 사용하지 않으므로
GitHub cron의 장기 비활성화에 대비한 유지 커밋도 필요하지 않습니다.

변경 사전 확인 구조의 운영 검증도 2026-11-16에 완료했습니다. 14:12(KST)에 기존 공개 글의
발행 요청 버튼을 눌렀고, 14:15 Netlify 예약 실행이 새 요청을 감지해 Actions를 한 번 호출했습니다.
[실제 발행 실행](https://github.com/ThinKim90/MyBlog/actions/runs/43809014032)은 테스트 58개,
타입 검사·빌드와 운영 반영 확인까지 통과했습니다. 본문·사진은 바꾸지 않고 요청 시각만 갱신했습니다.
다음 14:20 예약 실행은 `no_changes`로 종료했고, Actions 전체 실행 수는 83회로 유지됐습니다.
이 검증에서 Run now나 수동 Run workflow는 사용하지 않았습니다.

## 로컬에서 모든 작업본 확인

```sh
npm run notion:pull
npm run develop:cms
```

기존 개발 서버는 먼저 종료합니다. Notion을 수정한 뒤 `notion:pull`을 다시 실행하면 됩니다.
빈 본문은 글 목록에서 제외하고 `.notion-cache/preview-report.json`에 이유를 기록합니다.
작업본은 Git에서 제외된 `.notion-cache/preview/`에만 저장합니다.

`npm run notion:publish`는 새 발행 요청만 로컬 `notion-content/`에 반영합니다.
일반 개발/운영 빌드는 `contents/`의 기존 글과 `notion-content/posts/`의 확정된 공개본을 읽습니다.
로컬 미리보기에서는 공개본 대신 최신 Notion 작업본을 읽습니다.

## 사진과 보존

- Notion에 직접 업로드한 PNG/JPEG/WebP/GIF(한 장 20MB 이하)를 지원합니다.
- 기존 책 사진 2장은 `static/images/` 파일과 `/images/` 주소, 표시 크기를 유지합니다.
  Notion에서는 기존 블로그 주소를 사용하는 이미지 블록으로 보이며, 본문에서 사진을 교체할 수 있습니다.
  `notion-cms.config.json`의 `preservedImages`에 명시한 두 주소만 예외로 허용합니다.
  새 사진을 Notion에 업로드하면 아래의 다운로드·보관 경로로 처리합니다.
- 사진을 파일로 복사해 상대 주소로 연결하고, Gatsby가 표시 크기에 맞게 최적화합니다.
- 발행된 버전의 사진은 공개본과 함께 Git에 저장되어 만료되는 Notion 주소에 의존하지 않습니다.
- 초안 원문·사진·API 키·임시 다운로드 주소는 공개 저장소에 올리지 않습니다.
- `notion-content/manifest.json`은 마지막 처리 요청과 공개 버전을 기록합니다. 직접 수정하지 않습니다.
- 삭제/이동된 글은 API로 상태를 다시 확인한 뒤 제외합니다. 권한 오류를 삭제로 간주하지 않습니다.
- Notion 전용 토글·색상·임베드 등 지원하지 않는 서식은 오류를 표시합니다. 원고를 조용히 누락하지 않습니다.
- 기존 Markdown 글과 주소가 겹치면 빌드가 중단됩니다. 기존 원고를 자동으로 덮어쓰지 않습니다.
- 별도로 발행을 차단한 글은 없습니다. `블로그 CMS 연결 테스트`도 다른 글과 동일하게
  `Published` 상태와 새 발행 요청이 있으면 발행됩니다. 공개를 취소하려면 `Draft`로 바꿉니다.

공개본의 원문과 사진은 공개 Git 저장소에 남습니다. 과거에 공개한 글을 Draft로 되돌리는 것은
현재 사이트에서의 공개 취소이며 Git 이력까지 지우는 작업은 아닙니다.

검사: `npm test`, `npx tsc --noEmit`, `npm run build`.
