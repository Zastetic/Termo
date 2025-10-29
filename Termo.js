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
// ===== Lógica do tabuleiro =====
let linhaAtual = 1;
let colunaAtual = 1;
const totalLinhas = 6;
const totalColunas = 5;
let palavraDoDia = "PALCO"; 

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

// Confirmar 
function confirmarLinha() {
  if (colunaAtual <= totalColunas) {
    console.log("Linha incompleta!");
    return;
  }

  // Montar a palavra digitada
  let tentativa = "";
  for (let c = 1; c <= totalColunas; c++) {
    const celula = document.querySelector(
      `[data-row="${linhaAtual}"][data-col="${c}"]`
    );
    tentativa += celula.textContent;
  }

  tentativa = tentativa.toUpperCase();
  console.log(`Tentativa ${linhaAtual}: ${tentativa}`);

  // Colorir as letras
  for (let i = 0; i < totalColunas; i++) {
    const celula = document.querySelector(
      `[data-row="${linhaAtual}"][data-col="${i + 1}"]`
    );
    const letra = tentativa[i];
    celula.classList.remove("correct", "present", "absent");

    if (letra === palavraDoDia[i]) {
      celula.classList.add("correct"); 
    } else if (palavraDoDia.includes(letra)) {
      celula.classList.add("present");
    } else {
      celula.classList.add("absent"); 
    }
  }

  // Verifica se acertou
  if (tentativa === palavraDoDia) {
    setTimeout(() => {
      alert("8===D");
    }, 200);
    return;
  }

  // Avança para a próxima linha
  if (linhaAtual < totalLinhas) {
    linhaAtual++;
    colunaAtual = 1;
  } else {
    setTimeout(() => {
      alert(`"${palavraDoDia}".`);
    }, 200);
  }
}
