# Contributing to SentinelAI

Thank you for your interest in contributing to SentinelAI. We welcome contributions from developers, security researchers, and machine learning engineers worldwide.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please treat everyone with respect and professional courtesy.

---

## Getting Started

1. Fork the repository on GitHub:
   ```bash
   git clone https://github.com/your-username/Cyberagent-.git
   cd Cyberagent-
   ```
2. Create a local branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Set up the development environment as described in the [README.md](README.md).

---

## Development Guidelines

### Backend (Python / FastAPI)
- Use Python 3.11+.
- Adhere to PEP 8 standards. Format with `black` and lint with `flake8`.
- Write unit and integration tests under `backend/tests/` for all new features and bug fixes.
- Run tests before committing:
  ```bash
  pytest backend/tests -v
  ```

### Frontend (React / TypeScript / Tailwind CSS)
- Write strict TypeScript with explicit type interfaces.
- Use Tailwind CSS utility classes aligned with the Obsidian/Slate enterprise theme.
- Ensure zero emojis in code or UI labels. Use standard Lucide icons.
- Verify TypeScript compilation and production build:
  ```bash
  npm --prefix frontend run build
  ```

---

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or capability
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Code style, formatting, or theme visual changes
- `refactor:` Code restructuring without modifying functionality
- `test:` Adding or updating test cases
- `chore:` Build process, dependency updates, or repository maintenance

---

## Submitting Pull Requests

1. Rebase your branch against the latest `main` branch:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request on GitHub with a clear description of:
   - The problem being solved or the feature introduced.
   - Any relevant issue numbers.
   - Verification steps and test results.
