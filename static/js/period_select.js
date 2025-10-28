function setPeriodo(_periodo) {
  fetch('/set-periodo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodo: _periodo })
  })
  .then(res => res.json())
  .then(data => {
    localStorage["periodo"] = data.periodo
    window.location.reload()
  });
}