(() => {
  const dataEl = document.getElementById('books-data');
  if (!dataEl) return;
  const books = JSON.parse(dataEl.textContent);
  const byId = Object.fromEntries(books.map(b => [b.id, b]));
  let openId = null;

  const renderRating = (r) => {
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '●'.repeat(full) + (half ? '◐' : '') + '○'.repeat(empty);
  };

  const renderDetail = (book) => `
    <div class="book__detail-grid">
      <div class="book__detail-cover">
        ${book.cover ? `<img src="${book.cover}" alt="${book.title} cover" loading="lazy">` : ''}
      </div>
      <div class="book__detail-meta">
        <strong>${book.title}</strong>
        ${book.subtitle ? `<em>${book.subtitle}</em>` : ''}
        <p class="book__byline">${book.author}${book.year ? ` · ${book.year}` : ''}</p>
        ${book.rating ? `<p class="book__rating" aria-label="Rated ${book.rating} out of 5">${renderRating(book.rating)}</p>` : ''}
        <p class="book__tags">${book.tags.join(' · ')}</p>
        ${book.link ? `<p><a href="${book.link}" target="_blank" rel="noopener">Find this book →</a></p>` : ''}
        <button type="button" class="book__close">Close</button>
      </div>
    </div>
  `;

  const closeAll = () => {
    document.querySelectorAll('.book.is-open').forEach(b => {
      b.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.book__detail.is-open').forEach(d => d.classList.remove('is-open'));
    openId = null;
  };

  const shelf = document.querySelector('.bookshelf');
  if (!shelf) return;

  shelf.addEventListener('click', (e) => {
    if (e.target.closest('.book__close')) { closeAll(); return; }
    const book = e.target.closest('.book');
    if (!book) return;

    const id = book.dataset.bookId;
    if (openId === id) { closeAll(); return; }

    closeAll();
    const detail = document.getElementById(book.getAttribute('aria-controls'));
    book.classList.add('is-open');
    book.setAttribute('aria-expanded', 'true');
    detail.innerHTML = renderDetail(byId[id]);
    detail.classList.add('is-open');
    openId = id;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Tag filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('is-active', b === btn));
      document.querySelectorAll('.book').forEach(b => {
        const tags = (b.dataset.tags || '').split(/\s+/);
        const show = filter === 'all' || tags.includes(filter);
        b.style.display = show ? '' : 'none';
      });
      closeAll();
    });
  });
})();
