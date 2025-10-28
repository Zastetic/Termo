// muda o tema da pagina
function changetheme() {
    if (localStorage["theme"] == 'dark') {
        document.body.classList.add('dark')
    } else if (localStorage["theme"] == 'light') {
        document.body.classList.remove('dark')
    }
}
changetheme();

window.addEventListener('message', function(event) {
changetheme();
})