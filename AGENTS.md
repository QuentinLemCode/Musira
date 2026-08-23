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
