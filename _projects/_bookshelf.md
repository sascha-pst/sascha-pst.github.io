---
title: Bookshelf
description: A reading log built with Jekyll and Liquid — tagged, filterable, and updated as I go.
date: 2026-04-23
url: /projects/bookshelf/
image: /assets/images/bookshelf-thumb.jpg  # optional, if your theme uses one
tags: [jekyll, web, reading]
---

A personal bookshelf cataloging what I've been reading through my MIDS program
and beyond, with a lean toward algorithmic fairness, public interest tech, and
the occasional sci-fi palate cleanser.

Built with a single Jekyll `_data/books.yml` file, a Liquid template that
groups by year, and vanilla JS for tag filtering — no framework, no build step
beyond Jekyll itself.

[Visit the bookshelf →]({{ '/projects/bookshelf/' | relative_url }})
