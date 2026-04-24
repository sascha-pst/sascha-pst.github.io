---
layout: default
title: Bookshelf
subtitle: What I've been reading through MIDS and beyond.
permalink: /work/bookshelf/
date: 2026-01-01
status: Ongoing
featured: true
---

{% assign all_tags = site.books | map: 'tags' | join: ',' | split: ',' | uniq | sort %}
<nav class="bookshelf-filter" aria-label="Filter books by tag">
  <button class="bookshelf-filter__pill is-active" data-tag="all" type="button">All</button>
  {% for tag in all_tags %}
    <button class="bookshelf-filter__pill" data-tag="{{ tag | strip }}" type="button">{{ tag | strip | capitalize }}</button>
  {% endfor %}
</nav>

<ul class="bookshelf-grid">
  {% assign shelf = site.books | sort: "title" %}
  {% for book in shelf %}
    <li class="book" data-tags="{{ book.tags | join: ' ' }}">
      {% if book.link %}<a href="{{ book.link }}" class="book__link" target="_blank" rel="noopener">{% endif %}
        {% if book.cover %}
          <img class="book__cover" src="{{ book.cover }}" alt="Cover of {{ book.title }}">
        {% endif %}
      {% if book.link %}</a>{% endif %}
      <h3 class="book__title">{{ book.title }}</h3>
      {% if book.subtitle %}<p class="book__subtitle">{{ book.subtitle }}</p>{% endif %}
      {% if book.author %}<p class="book__author">{{ book.author }}</p>{% endif %}
      {% if book.rating %}
        <p class="book__rating" aria-label="Rating: {{ book.rating }} of 5">
          {% assign full = book.rating | floor %}
          {% assign has_half = book.rating | modulo: 1 %}
          {% for i in (1..full) %}★{% endfor %}{% if has_half != 0 %}½{% endif %}
        </p>
      {% endif %}
      {% if book.content != "" %}
        <div class="book__review">{{ book.content | markdownify }}</div>
      {% endif %}
    </li>
  {% endfor %}
</ul>

<script>
(function () {
  const pills = document.querySelectorAll('.bookshelf-filter__pill');
  const books = document.querySelectorAll('.book[data-tags]');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.dataset.tag;
      pills.forEach(p => p.classList.toggle('is-active', p === pill));
      books.forEach(book => {
        const tags = (book.dataset.tags || '').split(' ');
        book.hidden = !(tag === 'all' || tags.includes(tag));
      });
    });
  });
})();
</script>
