/**
 * Zupi - JavaScript Principal
 * Funções utilitárias e inicializações
 */

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips do Bootstrap (se necessário)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers do Bootstrap (se necessário)
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Inicializar funcionalidade de swipe para sidebar
    initSwipeSidebar();
});

// Função para destacar link ativo na navbar
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dashboard-sidebar .nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            if (currentPage === 'perfil-criancas.html'|| currentPage === 'relatorios.html') {
                return;
            }
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

// Função para inicializar swipe/arrastar para abrir sidebar
function initSwipeSidebar() {
    const offcanvasElement = document.getElementById('dashboardOffcanvas');
    if (!offcanvasElement) return;
    
    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    const swipeThreshold = 50; // Mínimo de pixels para considerar swipe
    
    // Detectar swipe da esquerda para direita na borda esquerda da tela
    document.addEventListener('touchstart', function(e) {
        // Só ativar se estiver na borda esquerda (primeiros 20px)
        if (e.touches[0].clientX < 20 && !offcanvasElement.classList.contains('show')) {
            touchStartX = e.touches[0].clientX;
            isSwiping = true;
        }
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (isSwiping) {
            touchEndX = e.touches[0].clientX;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (isSwiping) {
            const swipeDistance = touchEndX - touchStartX;
            
            // Se arrastou da esquerda para direita mais de 50px, abre a sidebar
            if (swipeDistance > swipeThreshold && touchStartX < 50) {
                offcanvas.show();
            }
            
            isSwiping = false;
            touchStartX = 0;
            touchEndX = 0;
        }
    }, { passive: true });
    
    // Fechar sidebar ao clicar em link (mobile)
    if (window.innerWidth <= 991) {
        const sidebarLinks = offcanvasElement.querySelectorAll('.nav-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                setTimeout(() => {
                    offcanvas.hide();
                }, 300);
            });
        });
    }
}

// Executar ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightActiveNavLink);
} else {
    highlightActiveNavLink();
}

