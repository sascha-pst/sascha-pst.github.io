---
layout: page
title: Blog
permalink: /blog/
---

<ul class="post-list">
  {% for post in site.posts %}
    <li class="post-list__item">
      <time class="post-list__date" datetime="{{ post.date | date_to_xmlschema }}">
        {{ post.date | date: "%B %-d, %Y" }}
      </time>
      <h2 class="post-list__title">
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h2>
      {% if post.excerpt %}
        <p class="post-list__excerpt">{{ post.excerpt }}</p>
      {% endif %}
      {% if post.tags %}
        <p class="post-list__tags">
          {% for tag in post.tags %}<span class="post-list__tag">{{ tag }}</span>{% unless forloop.last %} · {% endunless %}{% endfor %}
        </p>
      {% endif %}
    </li>
  {% endfor %}
</ul>
