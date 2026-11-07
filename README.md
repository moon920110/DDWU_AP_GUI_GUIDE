# Java Swing GUI 따라하기 가이드

학생용 Java Swing GUI 실습 가이드를 정적 웹 페이지로 만든 것입니다.
원본은 `Java Swing GUI 따라하기 가이드.pdf` 이고, 같은 내용을 8단계로 나눠
코드 · 번호 표 · 실행 화면을 연결해 보여 줍니다.

## 구성

| 경로 | 내용 |
| --- | --- |
| `index.html` | 가이드 본문. 각 단계의 Java 코드는 `<script type="text/x-java">` 블록에 들어 있습니다. |
| `assets/css/style.css` | 페이지 스타일과 Swing(Metal) 모양을 흉내 낸 위젯 스타일 |
| `assets/js/app.js` | 코드 하이라이트, ①②③ 번호 연결, 진행 체크, "직접 해보기" 시뮬레이션 |
| `assets/img/` | PDF에서 추출한 실행 화면 캡처 |
| `examples/` | 단계별 Java 소스 파일 (페이지의 코드와 동일, `javac` 로 컴파일 확인됨) |

## 페이지 기능

- 표 · 코드 주석 · 화면의 같은 번호에 마우스를 올리거나 클릭하면 함께 강조됩니다.
- 코드 블록마다 복사와 `.java` 다운로드 버튼이 있습니다.
- 단계마다 **직접 해보기** 탭에서 브라우저 안에서 동작하는 모사 창으로 예상 동작을 확인할 수 있습니다.
  `index.html?view=try` 로 열면 모든 단계가 직접 해보기 탭으로 열립니다 (수업 시연용).
- "따라 했어요" 체크는 브라우저(localStorage)에 저장됩니다.
- 밝은/어두운 화면, 모바일 레이아웃, 인쇄 스타일을 지원합니다.

## 배포

정적 파일만 있으므로 GitHub Pages(Settings → Pages → Branch: `main`, folder: `/`)에
올리면 바로 동작합니다. 로컬에서 보려면:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 예제 코드 확인

```bash
javac -encoding UTF-8 -d /tmp/out examples/*.java
```
