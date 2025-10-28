let trilho = document.getElementById('trilho')
let body = document.querySelector('body')
let iframe = document.querySelector('.iframe-conteudo')

if (localStorage["theme"] === undefined) {
  localStorage["theme"] = "light";
}
atualizarModoItudo()

function atualizarModoItudo() {
  iframe.contentWindow.postMessage("message")
  if (localStorage["theme"] == 'dark') {
      document.body.classList.add('dark')
    } else if (localStorage["theme"] == 'light') {
      document.body.classList.remove('dark')
  }
}

trilho.addEventListener('click', () => {
  localStorage["theme"] === "a"
  if (localStorage["theme"] === "dark") { localStorage["theme"] = 'light'; }
  else if (localStorage["theme"] === "light") { localStorage["theme"] = 'dark'; }
  atualizarModoItudo()
})


iframe.addEventListener('load', atualizarModoItudo)
