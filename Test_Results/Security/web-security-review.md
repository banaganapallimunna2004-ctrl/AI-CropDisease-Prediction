# Web Frontend Security Review Report

**Overall Risk Rating: Low Risk (Score: 72/100)**

## Findings Summary
| Finding ID | Category | Title | Severity |
|---|---|---|---|
| WEB-SEC-001 | Authentication | User PII stored in localStorage | Low |
| WEB-SEC-002 | Session Management | Lack of frontend session inactive timeout (TTL) | Low |
| WEB-SEC-003 | HTTP Headers | Missing Content Security Policy (CSP) meta tag | Low |
| WEB-SEC-004 | Clickjacking | Missing frame-ancestors / X-Frame-Options layout protections | Low |
| WEB-SEC-005 | Configuration | Hardcoded API base URL fallback in build environment | Low |
| WEB-SEC-006 | Information Disclosure | Detailed console logs active in production build | Low |
| WEB-SEC-007 | Cryptography | Insecure fallback hash for offline validation state | Low |
| WEB-SEC-008 | Transport Security | Forms submission permitted over HTTP fallbacks | Low |
| WEB-SEC-009 | Dependencies | Outdated react-router-dom package version | Low |
| WEB-SEC-010 | Cookies | Insecure cookie attributes configuration on client fallback | Low |
| WEB-SEC-011 | UI Security | Insecure target="_blank" links without rel="noopener" | Low |
| WEB-SEC-012 | Input Handling | Missing local character limits on text area description fields | Low |
| WEB-SEC-013 | Dependency Auditing | Unused dependencies listed in package.json | Low |
| WEB-SEC-014 | XSS Prevention | Direct HTML rendering via dangerouslySetInnerHTML fallback | Low |

## Detailed Findings
### [WEB-SEC-001] User PII stored in localStorage
- **Category:** Authentication
- **Severity:** Low
- **Description:** User profile details (email, phone, role) are saved directly in localStorage without encryption, exposing them to XSS access.
- **Recommendation:** Store sensitive session information in an HTTPOnly cookie or encrypted in-memory state.

### [WEB-SEC-002] Lack of frontend session inactive timeout (TTL)
- **Category:** Session Management
- **Severity:** Low
- **Description:** No automated mechanism is implemented to auto-logout users after a period of user inactivity on the dashboard.
- **Recommendation:** Implement an idle-timer component to automatically sign out users after 15-30 minutes of inactivity.

### [WEB-SEC-003] Missing Content Security Policy (CSP) meta tag
- **Category:** HTTP Headers
- **Severity:** Low
- **Description:** The main index.html does not define a Content-Security-Policy meta tag, enabling potential injection of unapproved external scripts.
- **Recommendation:** Add a <meta http-equiv="Content-Security-Policy" content="..."> tag restricting scripts and styles to trusted domains.

### [WEB-SEC-004] Missing frame-ancestors / X-Frame-Options layout protections
- **Category:** Clickjacking
- **Severity:** Low
- **Description:** There is no client-side checking to verify if the application is being loaded inside a frame or iframe on external domains.
- **Recommendation:** Enforce frame-busting scripts or specify appropriate Content Security Policies.

### [WEB-SEC-005] Hardcoded API base URL fallback in build environment
- **Category:** Configuration
- **Severity:** Low
- **Description:** A hardcoded API base URL (http://localhost:5000/api) is present as a fallback configuration inside frontend routes/context.
- **Recommendation:** Ensure the API URL is always fetched dynamically from environment configuration variables.

### [WEB-SEC-006] Detailed console logs active in production build
- **Category:** Information Disclosure
- **Severity:** Low
- **Description:** Console.log and debug traces are not automatically stripped during the production bundling process.
- **Recommendation:** Configure Vite build tools (esbuild minifier drop: ["console", "debugger"]) to strip logs on build.

### [WEB-SEC-007] Insecure fallback hash for offline validation state
- **Category:** Cryptography
- **Severity:** Low
- **Description:** A simple non-cryptographic local hashing mechanism is used for caching simple offline verification states.
- **Recommendation:** Use Web Cryptography API (SubtleCrypto) with SHA-256 for local caching integrity verification.

### [WEB-SEC-008] Forms submission permitted over HTTP fallbacks
- **Category:** Transport Security
- **Severity:** Low
- **Description:** There is no warning/restriction in the frontend login form if the active origin is loaded over unencrypted HTTP.
- **Recommendation:** Verify `window.location.protocol` is secure (https:) before allowing users to submit credentials.

### [WEB-SEC-009] Outdated react-router-dom package version
- **Category:** Dependencies
- **Severity:** Low
- **Description:** The project lists an older version of react-router-dom in package.json containing non-critical resolved warnings.
- **Recommendation:** Update react-router-dom to the latest stable release.

### [WEB-SEC-010] Insecure cookie attributes configuration on client fallback
- **Category:** Cookies
- **Severity:** Low
- **Description:** Client-side fallback cookie storage lacks explicit Secure and SameSite flags configuration.
- **Recommendation:** Always set Secure; SameSite=Strict when writing client cookies.

### [WEB-SEC-011] Insecure target="_blank" links without rel="noopener"
- **Category:** UI Security
- **Severity:** Low
- **Description:** External links to weather services or crop documentation open in new tabs without specifying rel="noopener noreferrer".
- **Recommendation:** Ensure all external links utilize rel="noopener noreferrer" to prevent reverse tab-nabbing.

### [WEB-SEC-012] Missing local character limits on text area description fields
- **Category:** Input Handling
- **Severity:** Low
- **Description:** Form text inputs do not enforce character length limits on the frontend before submitting data payloads.
- **Recommendation:** Enforce maxLength attributes on all interactive inputs.

### [WEB-SEC-013] Unused dependencies listed in package.json
- **Category:** Dependency Auditing
- **Severity:** Low
- **Description:** Dependencies like react-icons are included in the bundle configuration but are scarcely referenced.
- **Recommendation:** Prune unused dependencies to reduce package size and attack surface.

### [WEB-SEC-014] Direct HTML rendering via dangerouslySetInnerHTML fallback
- **Category:** XSS Prevention
- **Severity:** Low
- **Description:** Fallback text render helpers utilize innerHTML settings for loading localized translations containing tags.
- **Recommendation:** Sanitize dynamic localization variables using DOMPurify before rendering.

