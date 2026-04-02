const button = document.getElementById('actionButton');
const heading = document.querySelector('h1');

button.addEventListener('click', () => {
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    heading.textContent = 'Six seven';
    button.textContent = 'Why would you click this';
});