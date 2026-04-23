(function() {
  const buttons = document.querySelectorAll('.filter-btn');
  const books = document.querySelectorAll('.book');
  const yearSections = document.querySelectorAll('.bookshelf-year');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      books.forEach(book => {
        const tags = (book.dataset.tags || '').split(' ');
        const show = filter === 'all' || tags.includes(filter);
        book.style.display = show ? '' : 'none';
      });

      yearSections.forEach(section => {
        const visible = section.querySelectorAll('.book:not([style*="display: none"])');
        section.style.display = visible.length ? '' : 'none';
      });
    });
  });
})();
