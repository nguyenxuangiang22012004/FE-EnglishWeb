---
trigger: always_on
---

# Global Rules

Always scan .agent/skills before starting tasks.

If a matching skill exists:
- use it
- follow its rules
- follow its output structure

Coding standards:
- Use clean architecture
- Avoid duplicated logic
- Use TypeScript
- Keep files modular
- Do not write everything inline
- Extract reusable logic into separate functions/services/hooks
- Avoid large components and large files
- Separate business logic from UI
- Use meaningful naming
- Prefer reusable components over duplicated UI
- Keep functions single responsibility
- Use environment variables for configs/secrets
- Follow consistent folder structure