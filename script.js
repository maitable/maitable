document.querySelectorAll('a').forEach(a => {
  if (a.href === window.location.href) {
    a.classList.add('active');
  }
});

fetch('data.json')
  .then(r => r.json())
  .then(data => {
    const linksUl = document.querySelector('.help-menu ul');
    if (linksUl && data.links) {
      data.links.forEach(({ label, url }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = label;
        li.appendChild(a);
        linksUl.appendChild(li);
      });
    }

    const key = window.location.pathname.includes('enjoyables') ? 'enjoyables' : 'achievements';
    const ul = document.querySelector('.container ul');
    if (!ul || !data[key]) return;
    data[key].forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
  });
