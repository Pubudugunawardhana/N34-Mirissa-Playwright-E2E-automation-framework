# Security Policy

## Supported versions

This project is maintained on a rolling basis. Only the latest version on the `main` branch receives security fixes.

| Version         | Supported |
| --------------- | --------- |
| `main` (latest) | ✅        |
| Older commits   | ❌        |

## Reporting a vulnerability

**Please do not report security issues in public GitHub issues, discussions or pull requests.**

Report them privately with GitHub's private vulnerability reporting instead:

1. Go to the **[Security tab](https://github.com/Pubudugunawardhana/N34-Mirissa-Playwright-E2E-automation-framework/security)** of this repository.
2. Click **Report a vulnerability**.
3. Fill in as much as you can:
   - a description of the issue and its possible impact
   - the affected file(s), with a commit hash if possible
   - the steps to reproduce it, or a proof of concept
   - a suggested fix, if you have one

### What to expect

| Step                                   | Target time                                 |
| -------------------------------------- | ------------------------------------------- |
| Acknowledgement of your report         | within 3 business days                      |
| First assessment                       | within 7 days                               |
| Fix or mitigation for confirmed issues | depends on severity, usually within 30 days |

You will be kept updated as the report is investigated. With your permission, you will be credited in the fix.

## Scope

This repository is a test automation framework. It does not run a production service. The following are **in scope**:

- secrets or credentials committed to the repository or its history (for example a database connection string or `AUTH_SECRET`)
- weaknesses in the GitHub Actions workflow, such as secret exposure or unsafe triggers
- anything that could make the tests touch real data instead of the separate test database
- vulnerable dependencies that affect how this framework is used

The following are **out of scope**:

- the N34 Mirissa application itself. Report issues with the app in the [N34-Mirissa repository](https://github.com/Pubudugunawardhana/N34-Mirissa/security).
- the default `admin` / `admin` login, which exists only in the freshly seeded test database

## Security practices in this project

- **No secrets in code.** `TEST_DATABASE_URL`, `AUTH_SECRET` and the admin password are loaded from a git-ignored `.env` file locally, and from GitHub Secrets in CI.
- **Isolated test data.** Tests run against a separate Neon test branch that is wiped and re-seeded before each run. The framework refuses to start if `TEST_DATABASE_URL` matches the app's real `DATABASE_URL`.
- **No real emails or uploads.** The app under test runs with email sending and Cloudinary uploads turned off.
- **Least-privilege CI.** The workflow only requests the permissions it needs (`contents: read`, `pages: write`, `id-token: write`).
- **No deployments from pull requests.** Reports are published only from pushes to the main branch.
- **Pinned dependencies.** `package-lock.json` is committed, and CI installs with `npm ci` for reproducible builds.
