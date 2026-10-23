# PulseOS — API Architecture Notes & Policies

## 1. Rate Limiting Strategy
PulseOS enforces client-side and IP/token-level rate limiting using a token bucket algorithm to protect server resources, prevent brute force attacks, and control LLM inference expenditures.

| Route Group | Endpoints | Rate Limit | Scope / Key | Action on Exceeded |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST /auth/register`<br>`POST /auth/login` | **5 requests / min** | Client IP | Returns `429 Too Many Requests` with `Retry-After: 60` |
| **Token Refresh** | `POST /auth/refresh` | **20 requests / min** | Refresh Cookie Hash | Returns `429 Too Many Requests` |
| **Report Ingestion** | `POST /reports` | **10 uploads / min** | User UUID | Returns `429 Too Many Requests` ("Upload limit reached") |
| **AI Explanation** | `GET /reports/{id}/explain` | **5 streams / min** | User UUID | Returns `429 Too Many Requests` ("AI quota exceeded") |
| **General Read/Write** | `GET /vitals`, `POST /vitals`, `GET /doctors`, etc. | **60 requests / min** | User UUID / IP | Returns `429 Too Many Requests` |

---

## 2. File Upload Limits & Ingestion Pipeline
To safeguard backend compute and prevent malicious execution or buffer overflows, uploaded documents adhere to strict pre-processing checks:

1. **Maximum File Size**: Exactly **10.0 MB (10,485,760 bytes)**.
   - Files exceeding 10 MB are rejected immediately at the gateway level with `413 Payload Too Large`.
2. **Permitted Media Types**:
   - `application/pdf` (Adobe Portable Document Format)
   - `image/png` (Portable Network Graphics)
   - `image/jpeg` (Joint Photographic Experts Group)
3. **Magic-Byte Sniffing**:
   - The API inspects the initial byte headers (e.g., `%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`) to prevent disguised binaries from execution. Mismatched file extensions produce `422 Unprocessable Entity`.
4. **Content-Addressed Filenames**:
   - Uploads are saved using SHA-256 digests (`sha256(content).ext`) within an isolated directory tree. Original filenames are sanitized (removing `../`, control characters, and quotes) and stored strictly as display metadata in PostgreSQL.

---

## 3. API Versioning & Deprecation Policy

1. **Path Prefixing**:
   - All stable public endpoints are versioned under the `/api/v1` namespace prefix (e.g., `https://api.pulseos.health/api/v1`).
2. **Backward Compatibility**:
   - Additive changes (e.g., adding non-required response fields, optional query parameters) will not bump the major version.
   - Any breaking change (e.g., removing a field, changing a type, altering authentication scheme) requires a new path prefix (e.g., `/api/v2`).
3. **Deprecation Cycle**:
   - Deprecated endpoints will transmit `Sunset: <date>` and `Deprecation: true` HTTP headers with a minimum 6-month support runway before termination.

---

## 4. Open Questions
1. Should rate limit counters be persisted across API worker restarts using Redis, or is an in-process LRU cache sufficient for the MVP single-instance deployment?
2. Should we support batch report uploads (e.g. uploading 3 historical reports at once) in v1, or keep the interface strictly single-file until post-MVP?
