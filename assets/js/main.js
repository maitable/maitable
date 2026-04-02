const button = document.getElementById('actionButton');
const heading = document.querySelector('h1');

button.addEventListener('click', () => {
    heading.textContent = 'Thanks for visiting!';
    button.style.display = 'none';
});