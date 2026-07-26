## Description

Provide a clear and concise summary of the changes introduced in this pull request and the motivation behind them.

## Type of Change

- [ ] `bug`: Bug fix (non-breaking change which fixes an issue)
- [ ] `feat`: New feature (non-breaking change which adds functionality)
- [ ] `refactor`: Refactoring (code change that neither fixes a bug nor adds a feature)
- [ ] `docs`: Documentation update
- [ ] `style`: Formatting or visual adjustment
- [ ] `test`: Adding or updating test coverage
- [ ] `chore`: Tooling, CI, or dependency update

## Related Issues

Fixes # (issue reference)

## Verification Checklist

Please verify that all checks pass locally before requesting a review:

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero errors or warnings
- [ ] `npm run test:coverage` passes with 100% statement, branch, function, and line coverage
- [ ] `npm run test:e2e` passes (Playwright E2E + axe-core accessibility scan)
- [ ] `npm run build` completes successfully
- [ ] `npm run docs` generates API documentation without errors

## Commit Compliance

- [ ] Commit message follows [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] No AI co-author trailers (`Co-Authored-By`) are included in commit messages

## Screenshots / Visual Changes (if applicable)

Attach screenshots or recordings demonstrating UI or workflow changes.
