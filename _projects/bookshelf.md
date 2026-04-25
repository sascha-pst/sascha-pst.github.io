---
layout: default
title: Bookshelf
subtitle: A little library with local links.
url: /projects/bookshelf/
tech:
  - Jekyll
  - liquid
  - scss
  - JavaScript
  - HTML
featured: true
---

<section class="bookshelf-intro container">
  <h1 class="display">Bookshelf</h1>
  <p class="lede">A working library ~ what I'm reading, finished, and want to revisit.</p>
</section>

{% include bookshelf.html %}
<script src="{{ '/assets/js/bookshelf-filter.js' | relative_url }}" defer></script>
