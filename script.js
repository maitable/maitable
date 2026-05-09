document.querySelectorAll('a').forEach(a => {
  if (a.href === window.location.href) {
    a.classList.add('active');
  }
});

fetch('data.json')
  .then(r => r.json())
  .then(data => {
    const key = window.location.pathname.includes('enjoyables') ? 'enjoyables' : 'achievements';
    const ul = document.querySelector('ul');
    data[key].forEach(a => {
      const li = document.createElement('li');
      li.textContent = a;
      ul.appendChild(li);
    });
  });
