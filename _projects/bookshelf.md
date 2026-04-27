---
layout: project
title: A Little Library
subtitle: What I'm reading, thoughts and links to shop local.
url: /projects/bookshelf/
tech:
  - liquid
  - scss
  - JavaScript
featured: true
---

<section class="bookshelf-intro container">
  <h1 class="display">Bookshelf</h1>
  <p class="lede">A working library ~ what I'm reading, finished, and want to revisit.</p>
</section>

{% include bookshelf.html %}
<script src="{{ '/assets/js/bookshelf-filter.js' | relative_url }}" defer></script>
