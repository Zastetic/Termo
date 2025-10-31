// ===== Tutorial =====
const tutorial = document.getElementById('tutorial');
const startBtn = document.getElementById('start-btn');

if (startBtn && tutorial) {
  startBtn.addEventListener('click', () => {
    tutorial.style.display = 'none';
    const board = document.getElementById('board');
    if (board) board.classList.add('active');
    if (!palavraDoDia) {
      alert('Aguarde: carregando a palavra do dia. Tente novamente em alguns segundos.');
    } else {
      jogoAtivo = true;
    }
  });
} else {
  console.warn("Elemento 'tutorial' ou 'start-btn' não encontrado no HTML.");
}

// ===== Menu =====
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');
const daysContainer = document.getElementById('days');

if (menuBtn && menuOverlay) {
  menuBtn.addEventListener('click', () => {
    menuOverlay.style.display = 'flex';
  });
}
if (closeMenu && menuOverlay) {
  closeMenu.addEventListener('click', () => {
    menuOverlay.style.display = 'none';
  });
}
if (daysContainer) {
  for (let i = 0; i <= 30; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      console.log(`Dia ${i} selecionado`);
    });
    daysContainer.appendChild(btn);
  }
} else {
  console.warn("Elemento 'days' (container de dias) não encontrado.");
}

// ===== Estado e configuração do jogo =====
let palavraDoDia = "";
const totalLinhas = 6;
const totalColunas = 5;
let linhaAtual = 1;
let colunaAtual = 1;
let jogoAtivo = false;
let tabuleiro = Array.from({ length: totalLinhas }, () => Array(totalColunas).fill(""));

async function escolherPalavraDoDia() {
  try {
    for (let tentativa = 0; tentativa < 150; tentativa++) {
      const resposta = await fetch("https://api.dicionario-aberto.net/random");
      if (!resposta.ok) continue;
      const dados = await resposta.json();
      const palavra = (dados && dados.word ? dados.word : "").toString().toUpperCase();
      if (/^[A-ZÇ]{5}$/.test(palavra)) {
        palavraDoDia = palavra;
        console.log("Palavra do dia carregada:", palavraDoDia);
        if (tutorial && tutorial.style.display === 'none') jogoAtivo = true;
        return;
      }
    }

let temp = ["IGUAL", "HOTEL", "GOSMA", "FISGA", "DESSA", "tRONO", "BICHO", "GANSO","NARIZ"];
let indiceAleatorio = Math.floor(Math.random() * temp.length);
let palavraAL = temp[indiceAleatorio];
    palavraDoDia = palavraAL;
    console.warn("Não foi possível gerar palavra válida. Usando fallback:", palavraDoDia);
    if (tutorial && tutorial.style.display === 'none') jogoAtivo = true;
  } catch (erro) {
    console.error("Erro ao buscar palavra do dia:", erro);
    palavraDoDia = palavraAL;
    if (tutorial && tutorial.style.display === 'none') jogoAtivo = true;
  }
}
escolherPalavraDoDia();

// ===== Verificar palavra válida via API =====
async function verificarPalavraValida(palavra) {
  try {
    const resposta = await fetch(`https://api.dicionario-aberto.net/word/${palavra.toLowerCase()}`);
    if (!resposta.ok) return false;
    const dados = await resposta.json();
    return Array.isArray(dados) ? dados.length > 0 : !!dados;
  } catch (erro) {
    console.error("Erro ao verificar palavra:", erro);
    return false;
  }
}

// ===== Captura do teclado (só se jogoAtivo for true) =====
document.addEventListener("keydown", (evento) => {
  if (!jogoAtivo) {
    console.log("Jogo não iniciado ou palavra ainda está carregando.");
    return;
  }

  const tecla = evento.key.toUpperCase();

  if (/^[A-ZÇ]$/.test(tecla)) inserirLetra(tecla);
  else if (evento.key === "Backspace") apagarLetra();
  else if (evento.key === "Enter") confirmarLinha();
});

// ===== Inserir letra =====
function inserirLetra(letra) {
  if (colunaAtual > totalColunas) return;
  const celula = document.querySelector(`[data-row="${linhaAtual}"][data-col="${colunaAtual}"]`);
  if (!celula) {
    console.error("Célula não encontrada:", linhaAtual, colunaAtual);
    return;
  }

  celula.textContent = letra;
  tabuleiro[linhaAtual - 1][colunaAtual - 1] = letra;
  colunaAtual++;
}

// ===== Apagar letra =====
function apagarLetra() {
  if (colunaAtual === 1) return;
  colunaAtual--;
  const celula = document.querySelector(`[data-row="${linhaAtual}"][data-col="${colunaAtual}"]`);
  if (!celula) {
    console.error("Célula não encontrada ao apagar:", linhaAtual, colunaAtual);
    return;
  }
  celula.textContent = "";
  tabuleiro[linhaAtual - 1][colunaAtual - 1] = "";
}

// ===== Confirmar tentativa =====
async function confirmarLinha() {
  if (!jogoAtivo) {
    alert("O jogo ainda não começou ou a palavra do dia está carregando. Aguarde.");
    return;
  }

  if (colunaAtual <= totalColunas) {
    alert("A palavra deve ter 5 letras!");
    return;
  }

  const tentativa = tabuleiro[linhaAtual - 1].join("").toUpperCase();
  console.log(`Tentativa ${linhaAtual}: ${tentativa}`);
  console.log("Estado do tabuleiro:", tabuleiro);

  const valida = await verificarPalavraValida(tentativa);
  if (!valida) {
    alert(" Essa palavra não existe em português");
    return;
  }

  
  for (let i = 0; i < totalColunas; i++) {
    const celula = document.querySelector(`[data-row="${linhaAtual}"][data-col="${i + 1}"]`);
    if (!celula) continue;
    const letra = tentativa[i];
    celula.classList.remove("correct", "present", "absent");

    if (palavraDoDia && letra === palavraDoDia[i]) celula.classList.add("correct");
    else if (palavraDoDia && palavraDoDia.includes(letra)) celula.classList.add("present");
    else celula.classList.add("absent");
  }

  if (palavraDoDia && tentativa === palavraDoDia) {
    setTimeout(() => alert(`Parabéns: ${palavraDoDia}`), 200);
    jogoAtivo = false;
    return;
  }

  if (linhaAtual < totalLinhas) {
    linhaAtual++;
    colunaAtual = 1;
  } else {
    setTimeout(() => alert(`palavra: "${palavraDoDia}".`), 200);
    jogoAtivo = false;
  }
}
