// ===== Tutorial =====
const tutorial = document.getElementById('tutorial');
const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('click', () => {
  tutorial.style.display = 'none';
  document.getElementById('board').classList.add('active');
});

// ===== Menu =====
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');
const daysContainer = document.getElementById('days');
// Abrir e fechar menu
menuBtn.addEventListener('click', () => {
  menuOverlay.style.display = 'flex';
});
closeMenu.addEventListener('click', () => {
  menuOverlay.style.display = 'none';
});

// Gerar botões de dias
for (let i = 0; i <= 30; i++) {
  const btn = document.createElement('button');
  btn.textContent = i;
  btn.addEventListener('click', () => {
    console.log(`Dia ${i} selecionado`);
  });
  daysContainer.appendChild(btn);
}
// ===== Palavra do Dia =====
let palavraDoDia = ""; // será preenchida automaticamente

async function escolherPalavraDoDia() {
  try {
    // Faz várias tentativas até achar uma palavra de 5 letras
    for (let tentativa = 0; tentativa < 10; tentativa++) {
      const resposta = await fetch("https://api.dicionario-aberto.net/random");
      const dados = await resposta.json();

      let palavra = dados.word.toUpperCase();

      // Ignora palavras com acento, hífen ou tamanho diferente de 5
      if (/^[A-ZÇ]{5}$/.test(palavra)) {
        palavraDoDia = palavra;
        console.log("Palavra do dia:", palavraDoDia);
        return;
      }
    }

    // Caso não encontre uma boa palavra
    palavraDoDia = "CASAS";
    console.warn("Não foi possível gerar uma palavra válida, usando fallback:", palavraDoDia);
  } catch (erro) {
    console.error("Erro ao buscar palavra do dia:", erro);
    palavraDoDia = "CASAS";
  }
}

// Chama a função logo ao iniciar o jogo
escolherPalavraDoDia();
// ===== Lógica do tabuleiro =====
let linhaAtual = 1;
let colunaAtual = 1;
const totalLinhas = 6;
const totalColunas = 5;


// Captura o teclado
document.addEventListener("keydown", (evento) => {
  const tecla = evento.key.toUpperCase();

  if (/^[A-ZÇ]$/.test(tecla)) {
    inserirLetra(tecla);
  } else if (evento.key === "Backspace") {
    apagarLetra();
  } else if (evento.key === "Enter") {
    confirmarLinha();
  }
});

// Inserir uma letra na célula atual
function inserirLetra(letra) {
  if (colunaAtual > totalColunas) return; 

  const celula = document.querySelector(
    `[data-row="${linhaAtual}"][data-col="${colunaAtual}"]`
  );

  celula.textContent = letra;
  colunaAtual++;
}

// Apagar a última letra da linha
function apagarLetra() {
  if (colunaAtual === 1) return; 

  colunaAtual--;
  const celula = document.querySelector(
    `[data-row="${linhaAtual}"][data-col="${colunaAtual}"]`
  );

  celula.textContent = "";
}
// ===== Verificar se a palavra existe =====
async function verificarPalavraValida(palavra) {
  try {
    const resposta = await fetch(`https://api.dicionario-aberto.net/word/${palavra.toLowerCase()}`);
    const dados = await resposta.json();

    // A API retorna [] se a palavra não existir
    return dados && dados.length > 0;
  } catch (erro) {
    console.error("Erro ao verificar palavra:", erro);
    return false;
  }
}
// ===== Confirmar =====
async function confirmarLinha() {
  if (colunaAtual <= totalColunas) {
    console.log("Linha incompleta!");
    return;
  }

  // Monta a palavra digitada
  let tentativa = "";
  for (let c = 1; c <= totalColunas; c++) {
    const celula = document.querySelector(`[data-row="${linhaAtual}"][data-col="${c}"]`);
    tentativa += celula.textContent;
  }

  tentativa = tentativa.toUpperCase();
  console.log(`Tentativa ${linhaAtual}: ${tentativa}`);

  // Verifica se a palavra é válida na língua portuguesa
  const valida = await verificarPalavraValida(tentativa);
  if (!valida) {
    alert("Essa palavra não existe em português!");
    return;
  }

  // ===== Colorir as letras =====
  for (let i = 0; i < totalColunas; i++) {
    const celula = document.querySelector(`[data-row="${linhaAtual}"][data-col="${i + 1}"]`);
    const letra = tentativa[i];
    celula.classList.remove("correct", "present", "absent");

    if (letra === palavraDoDia[i]) celula.classList.add("correct");
    else if (palavraDoDia.includes(letra)) celula.classList.add("present");
    else celula.classList.add("absent");
  }

  // ===== Verificar acerto =====
  if (tentativa === palavraDoDia) {
    setTimeout(() => alert("Parabéns"), 200);
    return;
  }

  // Avançar para próxima linha
  if (linhaAtual < totalLinhas) {
    linhaAtual++;
    colunaAtual = 1;
  } else {
    setTimeout(() => alert(`Errou: "${palavraDoDia}".`), 200);
  }
}
