document.querySelectorAll('a').forEach(a => {
  if (a.href === window.location.href) {
    a.classList.add('active');
  }
});