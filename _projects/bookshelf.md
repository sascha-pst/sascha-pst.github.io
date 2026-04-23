---
layout: default
title: Bookshelf
subtitle: What I've been reading through MIDS and beyond.
permalink: /work/bookshelf/
---

<section class="bookshelf-intro">
  <h1 class="display">{{ page.title }}</h1>
  <p class="lede">{{ page.subtitle }}</p>
</section>

  {% assign shelf = site.books | sort: "year_published" | reverse %}
  {% assign books_by_year = shelf | group_by: "year_published" %}

{% for year in books_by_year %}
  <section class="bookshelf-year">
    <h2>{{ year.name | default: "Undated" }}</h2>
    <p class="bookshelf-count">{{ year.items | size }} book{% if year.items.size != 1 %}s{% endif %}</p>
    <ul class="bookshelf-grid">
      {% for book in year.items %}
        <li class="book">
          {% if book.link %}<a href="{{ book.link }}" class="book__link" target="_blank" rel="noopener">{% endif %}
            {% if book.cover %}
              <img class="book__cover" src="{{ book.cover }}" alt="Cover of {{ book.title }}">
            {% endif %}
            <h3 class="book__title">{{ book.title }}</h3>
            {% if book.subtitle %}<p class="book__subtitle">{{ book.subtitle }}</p>{% endif %}
            {% if book.author %}<p class="book__author">{{ book.author }}</p>{% endif %}
            {% if book.year_published %}<p class="book__year">{{ book.year_published }}</p>{% endif %}
            {% if book.rating %}
              <p class="book__rating" aria-label="Rating: {{ book.rating }} of 5">
                {% assign full = book.rating | floor %}
                {% for i in (1..5) %}{% if i <= full %}★{% else %}☆{% endif %}{% endfor %}
                <span class="book__rating-num">{{ book.rating }}</span>
              </p>
            {% endif %}
          {% if book.link %}</a>{% endif %}
          {% if book.review %}
            <div class="book__review">{{ book.review | markdownify }}</div>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
  </section>
{% endfor %}
