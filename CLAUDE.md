# CLAUDE.md

Standing brief for Claude Code working in this repo. Read this first; ask before deviating.

## Project

This is Sasha's personal portfolio at `sascha-pst.github.io`. Jekyll site deployed via GitHub Pages. Hosts a blog, a bookshelf feature, a Three.js spiral travel gallery, and an About page.

- Local build: `bundle exec jekyll serve`
- Deploy: push to `main`, GitHub Pages handles the rest
- Ruby/Bundler managed; do not modify `Gemfile.lock` unless explicitly asked

## Layout

- `_posts/` — published blog posts, filename `YYYY-MM-DD-slug.md`
- `_drafts/` — unpublished work; **default new posts here**, not `_posts/`
- `_layouts/`, `_includes/` — templates; touch carefully, they affect every page
- `_data/bookshelf.yml` — bookshelf entries (two-row shelf, click-to-open detail panels)
- `_sass/` — SCSS partials, including the design token file
- `assets/` — images, fonts, Three.js assets for the travel gallery

## Design system

Use semantic tokens from the SCSS token file. **Never hardcode hex values. Never invent new tokens** — ask first.

- Brand palette: alabaster, midnight, coral, moss, clay/peach
- Type: Inter (body/UI), JetBrains Mono (code/accents)
- Canonical separator: middot (`·`), not pipe or dash
- Logo: persimmon/clementine linemark (don't recolor without asking)

Tokens are enforced across SCSS, Liquid, and JS — if something looks like it needs a new color, the answer is almost always an existing semantic alias.

## Frontmatter schema

```yaml
---
layout: post           # required
title: ""              # required
date: YYYY-MM-DD       # required
tags: []               # optional, lowercase
excerpt: ""            # optional, used in listings
---
```

## Voice

This is the part that matters. The blog voice is **dead pan, self-aware, analytical, literary, allergic to corporate earnestness**. 

**Banned moves:**

- LinkedIn-thinkpiece openings ("In today's fast-paced world…", "We've all been there…")
- Hollow connectors: moreover, furthermore, in conclusion, it's worth noting that
- Manufactured vulnerability or motivational uplift
- Em-dash-heavy hype cadence ("This isn't just X — it's Y")
- Generic AI cadence: tricolons, "not just… but…", false-balance "while X, Y" sentences
- Hashtags, emoji, exclamation points (unless ironic and rare)

**Editorial scope by post type:**

- **Literary / personal posts** (e.g., "A Bowlcut for the Dog"): Claude does formatting, link-checking, frontmatter, copyediting for typos and Jekyll rendering issues only. **Do not rewrite prose.** If something reads off, flag it and ask.
- **Technical / argumentative posts** (e.g., synthetic data, federated learning, healthcare equity series): drafting transitions, suggesting structural edits, checking that the argument holds, and citation formatting are all fair game. 

When unsure whether a change is voice-altering, ask.

## Workflow

- Always run `bundle exec jekyll serve` locally before declaring a change done. Build errors are common when SCSS or Liquid breaks.
- Show a diff before committing. Never push to `main` without explicit confirmation.
- Commit messages: short, lowercase, present tense ("fix bookshelf two-row layout", not "Fixed the bookshelf").
- One concern per commit when possible.

## Things to ask before doing

- Adding a dependency (Gemfile, npm, anything)
- Creating a new layout or include
- Restructuring `_data/` files
- Touching the Three.js gallery (asset paths are fragile)
- Changing anything in the design token file
- Rewriting prose in a literary post

## Things not to do

- Don't paste API keys, secrets, or anything from `.env` into committed files
- Don't auto-generate alt text or excerpts and commit them silently — surface them for review
- Don't "improve" the voice
- Don't use `!important` in SCSS
- Don't add analytics, tracking, or third-party scripts without asking
