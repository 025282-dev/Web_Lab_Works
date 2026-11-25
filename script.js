function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.documentElement;

function getInitTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }   
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}