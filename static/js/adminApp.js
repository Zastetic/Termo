// Seleção de periodo da turma.
const formPeriodo = document.getElementById("periodo");

// Cria a table padrão
const patern_table = document.getElementById("pontuation_table");
patern_table.remove();
const selectClass = document.getElementById("casa")

function restaurarSelecao() {
  const valorSalvo = parseInt(localStorage.getItem("atual_class") || "0");

  // Espera até que o valor exista entre as opções
  selectClass.selectedIndex = valorSalvo
}

// Adiciona novas tabelas
function addClassTable(id, name, pontuation, icon) {    
    const new_table = patern_table.cloneNode(true); //Copia ela

    new_table.id = id;
    new_table.getElementsByTagName("h3").name.textContent = name;
    new_table.getElementsByTagName("p").points.textContent = pontuation; //Muda suas propiedades em favor dos argumentos da função
    new_table.getElementsByTagName("img").icon.src = icon;

    let parentElement = document.getElementById("holder");

    parentElement.appendChild(new_table);

    return 0;
}
// Adiciona a opção com os nomes das chaves de admin
function addAdminOptions(_name) {
  const edit_object = document.getElementById("edit-credencial-select");
  const remove_object = document.getElementById("delete-credencial-select");

  let opt1 = document.createElement("option"); opt1.id = _name + "1"
  opt1.value = _name;
  opt1.textContent = _name;

  let opt2 = opt1.cloneNode(true); opt2.id = _name + "2"

  edit_object.appendChild(opt1);
  remove_object.appendChild(opt2);

}

// Adiciona as opções no campo de opções
function addOption(id, name) {
    const parentElement = document.getElementById("casa");
    let opt = document.createElement("option");

    opt.value = name;
    opt.id = id;
    opt.textContent = name;

    parentElement.appendChild(opt);
}

function addHistoryEvent(event_content) {
  const parentElement = document.getElementById("historico-lista")
  const eventElement = document.getElementById("event-model").cloneNode(true)
  eventElement.id = "event"
  eventElement.textContent = event_content
  parentElement.appendChild(eventElement);
}

// PEGA O NOME DE TODAS AS CLASSES ALCOADAS NO DATABASE EM ORDENAÇÃO
function fetchClassesName() {
  return fetch(`/classes-name`)
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => data.names);
}

//  FUNÇÕES DE REQUISIÇÃO A API 

function fetchClassesPontuation() {
  return fetch('/classes-points')
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => data.points);
}

function fetchClassesIcons() {
  return fetch('/classes-icons')
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => data.icons);
}

function fetchAdminData() {
  return fetch('/get-admin-keys')
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => ({nomes: data.nome, usuarios: data.usuario, senhas: data.senhas}));
}

function fetchHistoryData() {
  return fetch(`/get-history`)
    .then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    })
    .then(data => (data.events));
}


// Faz todas as aquisições a API necessarias
fetchClassesName()
  .then(classesName => {
    const names = classesName // nome de todas as classes
    fetchClassesPontuation()
      .then(classesPoints => {
        const points = classesPoints; // pontos de todas as classes
        fetchClassesIcons()
          .then(ClassesIcons => {
            fetchHistoryData()
              .then(events => {
                const icons = ClassesIcons // Brasão de todas as classes

                for (var c = 0; c < names.length; c++) {
                  addClassTable("pontuation_table_" + c, names[c], points[c], ClassesIcons[c]) //Cria uma mini table com cada informação das casas
                  addOption(c, names[c])
                }

                // Adiciona os eventos no historico
                for (var c = 0; c < events.length; c++) {
                  addHistoryEvent(events[c])
                }
                restaurarSelecao();    
                document.getElementById('event-model').remove()
              })
          })
      })
      .catch(err => console.error(err));
  })
.catch(err => console.error(err));

fetchAdminData()
  .then(data => {
    const names = data.nomes;
    const usuario = data.usuarios;
    const senhas = data.senhas;

    for (let i = 0; i < names.length; i++) {
      addAdminOptions(names[i]);
    }
  })

// Modifica os pontos de determinada classe
function modify_points(event) {
    if (document.getElementById("casa").value == 0) { alert("Por favor, ensira uma casa."); return 0 }

    const clickedButton = event.submitter;
    let casa = document.getElementById("casa").value;
    let pontos = clickedButton.value
    let textInButton = clickedButton.textContent
    textInButton = textInButton.slice(0, textInButton.indexOf("("))

    pontos = parseInt(pontos);

    window.location.href = `/modify_points?casa=${casa}&pontos=${pontos}&motivo=${textInButton}`;
}

function modify_admin_key_data(event) {
  let user_name = document.getElementById("edit-credencial-select").value;
  
  let new_user = document.getElementsByName("new_user")[0].value;
  let new_pass = document.getElementsByName("new_password")[0].value;

  window.location.href = `/modify-admin-keys?name=${user_name}&new_user=${new_user}&new_pass=${new_pass}`;

}
// FORM EVENT LISTENERS

// Adiciona os pontos para cada boa ação. Quantidade de pontos definida pelo ID.
const formGoodActions = document.getElementById('good-actions');
formGoodActions.addEventListener('submit', (event) => {event.preventDefault(); modify_points(event); localStorage.setItem("atual_class", selectClass.selectedIndex);});

// Edita as credenciais de um admin
const formEditAdminKey = document.getElementById('edit-credencial');
formEditAdminKey.addEventListener('submit', (event) => {event.preventDefault(); modify_admin_key_data(event);});

// Remove os pontos pra cada ação negativa.
const formBadActions = document.getElementById('bad-actions');
formBadActions.addEventListener('submit', (event) => {event.preventDefault(); modify_points(event); localStorage.setItem("atual_class", selectClass.selectedIndex);});

// Formulario de periodo
formPeriodo.addEventListener('submit', (event) => {
    localStorage.setItem("atual_class", 0)
    const p = formPeriodo.childNodes[1].options[formPeriodo.childNodes[1].selectedIndex].id
    setPeriodo(p)
})