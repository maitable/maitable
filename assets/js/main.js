const button = document.getElementById('actionButton');
const heading = document.querySelector('h1');
const navLinks = document.querySelectorAll('nav a');
const projectItems = document.querySelectorAll('#projects li');

navLinks.forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        //if (target) {
        //    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        //}
    });
});

let buttonState = 0;
const secrets = [
    'Here is a secret: You are already building something great!',
    'Neat fact: This site uses JavaScript for interactive behavior.',
    'Keep going: polish is in the details, and you are in control.'
];

button.addEventListener('click', () => {
    heading.textContent = 'Thanks for checking this out!';
    button.textContent = 'Show another secret';
    //document.getElementById('about').scrollIntoView({ behavior: 'smooth' });

    const toast = document.createElement('div');
    toast.className = 'secret-toast';
    toast.textContent = secrets[buttonState % secrets.length];
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('visible');
    }, 20);

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 2600);

    buttonState += 1;
});

projectItems.forEach(item => {
    const detail = document.createElement('small');
    detail.textContent = ' Click to toggle more details.';
    detail.className = 'project-tip';
    item.appendChild(detail);

    item.addEventListener('click', () => {
        item.classList.toggle('expanded');
        if (item.classList.contains('expanded')) {
            item.dataset.original = item.textContent;
            item.textContent = item.textContent.replace(' Click to toggle more details.', '');
            const extra = document.createElement('p');
            extra.className = 'project-details';
            extra.textContent = 'More interaction has been added: this project description expands in place to show more information. Add your real project story here.';
            item.appendChild(extra);
        } else {
            const extra = item.querySelector('.project-details');
            if (extra) extra.remove();
            item.appendChild(detail);
        }
    });
});