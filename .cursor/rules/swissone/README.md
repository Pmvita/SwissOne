# SwissOne Cursor Rules

This directory contains project-specific cursor rules for the SwissOne banking application.

## Rules Overview

- **general-rules.mdc** - General development guidelines and principles
- **banking-specific-rules.mdc** - Banking domain-specific patterns and compliance considerations
- **ui-ux-guidelines.mdc** - Swiss banking UI/UX design guidelines

## Usage

These rules are automatically applied when working in the SwissOne project. They complement the existing cursor rules from `.cursor/rules/` directory.

## Adding New Rules

When adding new rules:

1. Create a new `.mdc` file in this directory
2. Follow the frontmatter format:
   ```markdown
   ---
   description: Brief description of the rule
   globs: **/*.{ts,tsx}  # Files this applies to
   ---
   ```
3. Document the rule clearly
4. Update this README if needed

