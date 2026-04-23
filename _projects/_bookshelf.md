---
layout: page
title: Bookshelf
permalink: /projects/bookshelf/
---

<p><a href="{{ '/projects/' | relative_url }}">← Back to projects</a></p>

<section class="bookshelf-filters">
  <span>Filter:</span>
  <button class="filter-btn is-active" data-filter="all">All</button>
  {% assign all_tags = site.data.books | map: "tags" | join: "," | split: "," | uniq | sort %}
  {% for tag in all_tags %}
    {% if tag != "" %}
      <button class="filter-btn" data-filter="{{ tag }}">{{ tag | replace: "-", " " | capitalize }}</button>
    {% endif %}
  {% endfor %}
</section>

{% assign books_by_year = site.data.books | group_by: "year" | sort: "name" | reverse %}
{% for year_group in books_by_year %}
  <section class="bookshelf-year">
    <h2>{{ year_group.name }}</h2>
    <p class="bookshelf-count">{{ year_group.items | size }} books</p>
    <div class="bookshelf-grid">
      {% for book in year_group.items %}
        {% include book-card.html book=book %}
      {% endfor %}
    </div>
  </section>
{% endfor %}

<script src="{{ '/assets/js/bookshelf-filter.js' | relative_url }}"></script>
