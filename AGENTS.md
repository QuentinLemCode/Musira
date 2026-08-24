# Development Guidelines for Musira

## General Rules

### Pre-Commit Checks

**Before committing and pushing any changes:**

- Run the linter: `npm run lint` (or `npm run lint --workspace=packages/backend` for backend only)
- Run Prettier formatting: `npm run format` (or `npx prettier --write`)
- All linting errors must be resolved
- Code must be properly formatted

### Backend-Frontend Synchronization

**Backend changes that affect API responses, data models, or user-facing behavior MUST be reflected in the frontend.**

- When adding new API endpoints, update or generate the corresponding frontend client code
- When modifying API response structures, update all frontend components that consume that data
- When adding new error states or status messages, ensure the frontend properly handles and displays them to users
- When introducing new user-facing features or messages, verify they are visible and clear in the UI

### Testing Requirements

#### End-to-End (E2E) Testing

Each important feature must have E2E test coverage to ensure:

- User flows work correctly from start to finish
- Integration between frontend and backend functions properly
- Edge cases and error states are handled gracefully

#### Unit Testing

All new code must include unit tests to ensure non-regression:

**Backend:**

- Test all service methods with various inputs (valid, invalid, edge cases)
- Test all controller endpoints with different scenarios
- Mock external dependencies (databases, APIs, etc.)
- Achieve minimum 80% code coverage for critical paths

**Frontend:**

- Test all component rendering states
- Test all user interactions (clicks, form submissions, etc.)
- Test all observable subscriptions and async operations
- Mock API services and external dependencies

### Code Quality

- Follow existing code style and patterns
- Keep changes minimal and focused
- Add appropriate TypeScript types
- Include meaningful commit messages
- Document complex logic with comments

## Specific Guidelines

### Spotify Integration

When making changes to Spotify integration:

- Ensure token renewal failures are handled gracefully
- Display clear user messages when re-authentication is required
- Stop music playback when Spotify session is invalidated
- Test OAuth flows thoroughly

### Session Management

When modifying session-related code:

- Ensure session state is properly synchronized between frontend and backend
- Handle edge cases (expired sessions, concurrent users, etc.)
- Update both UI state and backend data consistently

### Error Handling

When adding error handling:

- Log errors with sufficient context for debugging
- Handle circular references in error objects (use replacer functions)
- Display user-friendly error messages in the frontend
- Include actionable guidance for users when possible

## Architecture Rules (learned from the 2026 audit — do not regress)

### Security

- **No insecure fallbacks in code.** Required environment variables
  (`JWT_SECRET`, `COOKIE_SECRET`, `DEFAULT_ADMIN_PASSWORD`, ...) must fail fast
  at startup instead of falling back to a hardcoded default. Never commit
  secrets, keys or certificates (`.pem` files are gitignored).
- **Validate every request body.** Use class-validator DTO classes consumed via
  the global `ValidationPipe` (`whitelist: true`). Never bind raw entities or
  untyped interfaces to `@Body()`.
- **Hash passwords with argon2** (`@node-rs/argon2`, see
  `packages/backend/src/app/utils/hash.ts`). Legacy HMAC hashes are verified and
  transparently re-hashed at login — keep that migration path until all users
  have logged in post-migration.
- **Authorization must be explicit.** Guarded routes should use
  `SessionCreatorGuard` / `RolesGuard` rather than inline service calls, and
  every async authorization check must be awaited.
- **Public auth endpoints are rate-limited** via the `RateLimit` decorator —
  apply it to any new endpoint that accepts credentials or OAuth codes.

### Per-session scoping

The app supports multiple concurrent music sessions. Anything keyed globally is
a bug:

- BullMQ job ids, running-state flags, in-memory caches and playback caches
  must be scoped per session id (see `queue-engine.service.ts`,
  `spotify-api.service.ts`).
- Repository queries for queue/backlog state must filter by session unless the
  query is intentionally global (admin listings).
- Do not log PII (full user profiles) — log stable identifiers only.

### Frontend RxJS

- Never call `.error()` on long-lived `ReplaySubject`s: a transient failure
  would terminally kill the stream for all subscribers. Log/skip and let the
  next poll retry.
- Return `EMPTY` / `of(...)` when there is no active session; never return a
  subject nobody will emit into.
- Treat values emitted by shared subjects as immutable: copy before mutating.

### Dependency management

- The Docker build runs `npm ci` against the **root** lockfile. After changing
  any workspace `package.json`, regenerate the root lockfile
  (`npm install`) in the same commit, otherwise the image build fails.
- Keep local `node_modules` in sync with the lockfile (`npm ci`); stale nested
  copies cause phantom type errors that CI does not reproduce.
