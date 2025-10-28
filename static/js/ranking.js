let basic_item_element = document.querySelector(".item");

function createElement(name, points, classification, icon_path) {
  let local = document.getElementsByClassName("container");

  let base_element_copy = basic_item_element.cloneNode(true);

  base_element_copy.id = name
  base_element_copy.getElementsByClassName("pontos")[0].textContent = `${points} pontos`;
  base_element_copy.getElementsByClassName("name")[0].textContent = name;
  base_element_copy.getElementsByClassName("classificacao")[0].textContent = classification;
  base_element_copy.getElementsByClassName("icon")[0].src = icon_path

  local[0].appendChild(base_element_copy);
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

// PEGA OS PONTOS DE TODAS AS CLASSES NO DATABASE EM ORDENAÇÃO
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

// Faz todas as aquisições a API necessarias (nome e pontos de todas as salas)
fetchClassesName()
  .then(classesName => {
    const names = classesName;
    fetchClassesPontuation()
      .then(classesPoints => {
        const points = classesPoints;
        fetchClassesIcons()
          .then(classesIcons => {
            const icons = classesIcons;
            const salas = [];

            for (let i = 0; i < classesName.length; i++) {
              console.log(icons[i])
              let data = {icon: icons[i], name: names[i], points: points[i]};
              salas.push(data);
            }
            // ORGANIZA TODAS AS SALAS EM ORDEM CRESCENTE
            salas.sort((a, b) => a.points - b.points);
            
            // ADICIONA O ELEMENTO CORRESPONDENTE DE TODAS AS SALAS EM ORDEM DECRECENTE
            for (let i = names.length-1; i >= 0; i--) {
              createElement(salas[i].name, salas[i].points, names.length-i, salas[i].icon);
            }
            basic_item_element.remove();

        })
        .catch(err => console.error(err));
      })  
      .catch(err => console.error(err));
  })
.catch(err => console.error(err));