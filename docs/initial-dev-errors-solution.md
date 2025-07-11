# 초기 개발 환경 설정 오류 및 해결 과정

이 문서는 Awarefit-CRM 초기 개발 환경 설정 시 마주쳤던 주요 오류들과 그 해결 과정을 기록합니다.

---

## 1. 발생한 오류 요약

개발 서버를 처음 실행했을 때, 다음과 같은 세 가지 주요 문제가 발생했습니다.

1.  **콘텐츠 보안 정책(CSP) 경고**: `Electron Security Warning (Insecure Content-Security-Policy)`
2.  **웹팩(Webpack) 환경 변수 경고**: `Conflicting values for 'process.env.NODE_ENV'`
3.  **`require` 참조 오류**: `Uncaught ReferenceError: require is not defined`

## 2. 문제 해결 과정

### 문제 1: 콘텐츠 보안 정책(CSP) 경고

-   **원인**: Electron의 렌더러 프로세스(웹 화면)에 콘텐츠 보안 정책이 설정되어 있지 않았습니다. 이 경우 외부 스크립트나 리소스 로딩에 제한이 없어 잠재적인 보안 위협(XSS 공격 등)에 노출될 수 있다는 경고입니다.
-   **해결**: `src/renderer/index.html` 파일의 `<head>` 태그 안에 아래와 같이 CSP 관련 메타 태그를 추가했습니다. 이 정책은 앱 자체 리소스와 개발 서버(localhost:3002)와의 통신만 허용하여 보안을 강화합니다.
    ```html
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:3002; img-src 'self' data:; font-src 'self';">
    ```

### 문제 2: 웹팩(Webpack) 환경 변수 경고

-   **원인**: `webpack.config.js` 파일에서 웹팩의 `mode` 옵션과 `DefinePlugin`을 통해 `process.env.NODE_ENV` 환경 변수가 중복으로 정의되고 있었습니다. 웹팩 5버전부터는 `mode` 설정(`development` 또는 `production`)에 따라 이 변수가 자동으로 최적화되므로, 수동으로 정의할 경우 경고가 발생합니다.
-   **해결**: `webpack.config.js`의 `DefinePlugin` 설정에서 아래 라인을 제거하여 중복 정의를 해결했습니다.
    ```javascript
    // 제거 전
    new (require('webpack')).DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      'global': 'globalThis'
    })

    // 제거 후
    new (require('webpack')).DefinePlugin({
      'global': 'globalThis'
    })
    ```

### 문제 3: `require is not defined` 참조 오류

-   **원인**: Electron 12버전 이후부터 보안이 강화되어, 렌더러 프로세스에서 기본적으로 Node.js API(예: `require`, `process`)를 직접 사용할 수 없게 되었습니다. `webPreferences`의 `nodeIntegration` 기본값이 `false`로 변경되었기 때문입니다.
-   **해결**: `src/main/main.ts` 파일에서 `BrowserWindow`를 생성하는 부분의 `webPreferences` 옵션을 변경하여 렌더러 프로세스가 Node.js API를 사용하도록 허용했습니다.
    ```typescript
    // 수정 전
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // ...
    }

    // 수정 후
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // nodeIntegration을 true로 설정할 경우 contextIsolation은 false로 설정하는 것이 일반적입니다.
      // ...
    }
    ```

---

위 조치들을 통해 초기 개발 환경에서 발생한 오류들을 모두 해결하고 안정적인 개발을 이어갈 수 있게 되었습니다. 