(function () {
  if (document.getElementById('zupiPageNav')) return;
  if (!localStorage.getItem('userId')) return;

  const nav = document.createElement('nav');
  nav.id = 'zupiPageNav';
  nav.className = 'navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm mb-4';
  nav.innerHTML = [
    '<div class="container-fluid">',
    '<a class="navbar-brand fw-bold" style="color:#7EC8E6" href="/dashboard">Zupi</a>',
    '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#zupiNavCollapse"><span class="navbar-toggler-icon"></span></button>',
    '<div class="collapse navbar-collapse" id="zupiNavCollapse">',
    '<ul class="navbar-nav ms-auto">',
    '<li class="nav-item"><a class="nav-link" href="/dashboard">Dashboard</a></li>',
    '<li class="nav-item"><a class="nav-link" href="/selecao-perfil">Relatórios</a></li>',
    '<li class="nav-item"><a class="nav-link" href="/agenda">Agenda</a></li>',
    '<li class="nav-item"><a class="nav-link" href="/biblioteca">Biblioteca</a></li>',
    '<li class="nav-item"><a class="nav-link" href="/feed">Feed</a></li>',
    '<li class="nav-item"><a class="nav-link" href="/configuracoes">Configurações</a></li>',
    '</ul></div></div>'
  ].join('');

  const main = document.querySelector('main');
  if (main) main.parentNode.insertBefore(nav, main);
})();
