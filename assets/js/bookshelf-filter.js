(function() {
  const buttons = document.querySelectorAll('.filter-btn');
  const books = document.querySelectorAll('.book');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      books.forEach(book => {
        const tags = (book.dataset.tags || '').split(' ').filter(Boolean);
        book.style.display = (filter === 'all' || tags.includes(filter)) ? '' : 'none';
      });
    });
  });
})();
