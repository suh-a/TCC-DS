# Guia de Uso - Bootstrap 5 no Projeto Zupi

Este documento descreve como usar o novo padrão Bootstrap 5 implementado no projeto Zupi.

## 📁 Estrutura de Arquivos

```
src/
├── assets/
│   ├── css/
│   │   └── custom.css          # Único arquivo CSS customizado
│   ├── js/
│   │   └── main.js             # JavaScript principal
│   └── img/                     # Imagens do projeto
└── pages/                       # Todas as páginas HTML
```

## 🎨 Sistema de Cores

O projeto usa variáveis CSS personalizadas definidas em `custom.css`:

- `--zupi-primary`: #7EBCE6 (Azul principal)
- `--zupi-secondary`: #F9E39A (Amarelo)
- `--zupi-accent`: #A8E6CF (Verde claro)
- `--zupi-highlight`: #FFB677 (Laranja)
- `--zupi-bg`: #F1F1F1 (Fundo)
- `--zupi-text`: #333 (Texto)

## 📄 Template Base

Todas as páginas seguem esta estrutura básica:

### 1. Head (Cabeçalho)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Título da Página — Zupi</title>
  
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Custom CSS -->
  <link rel="stylesheet" href="../assets/css/custom.css" />
  
  <link rel="icon" href="../assets/img/favicon.png" type="image/png">
</head>
```

### 2. Navbar (Barra de Navegação)

**Para páginas públicas:**

```html
<nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm" role="navigation" aria-label="Navegação principal">
  <div class="container">
    <a class="navbar-brand" href="index.html" aria-label="Zupi - Página inicial">Zupi</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Alternar navegação">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto align-items-center">
        <li class="nav-item">
          <a class="nav-link" href="index.html">Início</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="sobre.html">Sobre</a>
        </li>
        <li class="nav-item">
          <a class="btn btn-primary ms-2" href="login.html" role="button">Entrar</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

**Para páginas internas (com sidebar):**

```html
<div class="container-fluid">
  <div class="row">
    <nav class="col-md-3 col-lg-2 dashboard-sidebar p-0 position-fixed vh-100">
      <div class="d-flex flex-column p-4 h-100">
        <div class="navbar-brand text-white mb-4 fs-3 fw-bold">Zupi</div>
        <ul class="nav nav-pills flex-column">
          <li class="nav-item mb-2">
            <a class="nav-link text-white" href="dashboard-pais.html">Dashboard</a>
          </li>
          <!-- Mais itens -->
        </ul>
      </div>
    </nav>
    <main class="col-md-9 col-lg-10 ms-auto px-4 py-4">
      <!-- Conteúdo -->
    </main>
  </div>
</div>
```

### 3. Footer (Rodapé)

```html
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="row text-center">
      <div class="col-12">
        <p class="mb-0">© 2025 Zupi. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
</footer>
```

### 4. Scripts (Final do Body)

```html
<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
</body>
</html>
```

## 🎯 Componentes Bootstrap Mais Usados

### Cards

```html
<div class="card">
  <div class="card-body">
    <h3 class="card-title h5">Título</h3>
    <p class="card-text">Conteúdo do card.</p>
    <a href="#" class="btn btn-primary">Ação</a>
  </div>
</div>
```

### Botões

```html
<!-- Botão primário -->
<a href="#" class="btn btn-primary">Ação</a>

<!-- Botão secundário -->
<a href="#" class="btn btn-outline-primary">Ação</a>

<!-- Botão de destaque -->
<a href="#" class="btn btn-warning">Ação</a>
```

### Grid System

```html
<div class="container">
  <div class="row g-4">
    <div class="col-md-6 col-lg-4">
      <!-- Conteúdo -->
    </div>
    <div class="col-md-6 col-lg-4">
      <!-- Conteúdo -->
    </div>
  </div>
</div>
```

### Formulários

```html
<form>
  <div class="mb-3">
    <label for="email" class="form-label">E-mail</label>
    <input type="email" class="form-control" id="email" required>
  </div>
  <button type="submit" class="btn btn-primary">Enviar</button>
</form>
```

### Progress Bars

```html
<div class="progress">
  <div class="progress-bar bg-zupi-primary" role="progressbar" style="width: 75%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
</div>
```

## 🎨 Classes Utilitárias Customizadas

O arquivo `custom.css` inclui classes utilitárias específicas do Zupi:

- `.text-zupi-primary` - Cor primária do texto
- `.text-zupi-highlight` - Cor de destaque do texto
- `.bg-zupi-primary` - Fundo primário
- `.bg-zupi-accent` - Fundo accent
- `.bg-zupi-highlight` - Fundo highlight

## ♿ Acessibilidade

Todas as páginas incluem:

- `role` attributes apropriados
- `aria-label` em elementos interativos
- `aria-current="page"` em links ativos
- `aria-required="true"` em campos obrigatórios
- Estrutura semântica (header, main, footer, nav, section)

## 📱 Responsividade

O Bootstrap 5 garante responsividade automática através de:

- **Breakpoints**: xs, sm, md, lg, xl, xxl
- **Grid System**: `col-*`, `col-sm-*`, `col-md-*`, `col-lg-*`
- **Navbar**: Colapsa automaticamente em telas pequenas
- **Sidebar**: Adapta-se em dispositivos móveis

## 🔧 Criando Novas Páginas

1. **Copie a estrutura base** de uma página similar
2. **Use classes Bootstrap** sempre que possível
3. **Adicione estilos customizados** apenas em `custom.css` se necessário
4. **Mantenha a consistência** com navbar e footer padrão
5. **Teste a responsividade** em diferentes tamanhos de tela

## 📝 Exemplo Completo de Página Nova

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nova Página — Zupi</title>
  
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Custom CSS -->
  <link rel="stylesheet" href="../assets/css/custom.css" />
  
  <link rel="icon" href="../assets/img/favicon.png" type="image/png">
</head>
<body>

  <!-- FUNDO DECORATIVO (opcional) -->
  <div class="background-decor" aria-hidden="true">
    <!-- Elementos decorativos -->
  </div>

  <!-- NAVBAR -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm" role="navigation" aria-label="Navegação principal">
    <!-- Conteúdo da navbar -->
  </nav>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="container py-5">
    <section>
      <h1 class="section-title">Título da Página</h1>
      <p class="section-subtitle">Subtítulo ou descrição</p>
      
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title h5">Card 1</h3>
              <p class="card-text">Conteúdo do card.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="footer" role="contentinfo">
    <div class="container">
      <div class="row text-center">
        <div class="col-12">
          <p class="mb-0">© 2025 Zupi. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  </footer>

  <!-- Bootstrap 5 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
</body>
</html>
```

## 🚀 Boas Práticas

1. **Sempre use classes Bootstrap** antes de criar CSS customizado
2. **Mantenha o custom.css mínimo** - apenas ajustes específicos do projeto
3. **Use o grid system** para layouts responsivos
4. **Teste em diferentes dispositivos** antes de finalizar
5. **Mantenha a consistência** visual em todas as páginas
6. **Priorize acessibilidade** - use roles e aria-labels

## 📚 Recursos

- [Documentação Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Bootstrap Examples](https://getbootstrap.com/docs/5.3/examples/)

---

**Última atualização**: Janeiro 2025
**Versão Bootstrap**: 5.3.2

