/**
 * Rotas amigáveis (Vite reescreve para *.html em dev/preview).
 */
const ZupiRoutes = {
    home: '/',
    login: '/login',
    cadastro: '/cadastro',
    dashboard: '/dashboard-pais',
    dashboardPais: '/dashboard-pais',
    dashboardCrianca: '/dashboard-crianca',
    dashboardAlunoCredenciado: '/dashboard-aluno-credenciado',
    dashboardResponsavelCredenciado: '/dashboard-responsavel-credenciado',
    dashboardEscola: '/dashboard-escola',
    dashboardDocente: '/dashboard-docente',
    dashboardAdmin: '/dashboard-admin',
    selecaoPerfil: '/selecao-perfil',
    selecaoRelatorios: '/selecao-relatorios',
    relatorios: '/relatorios',
    agenda: '/agenda',
    configuracoes: '/configuracoes',
    menuJogos: '/menuJogos',
    cadastroDependentes: '/cadastro-dependentes',
    perfilCriancas: '/perfil',
    onboardingCrianca: '/onboarding-crianca',
    esqueciSenha: '/esqueci-senha',
    redefinirSenha: '/redefinir-senha',
    contato: '/contato',
    planos: '/planos',
    sobre: '/sobre',
    feed: '/feed',
    biblioteca: '/biblioteca',
    ajuda: '/ajuda'
};

window.ZupiRoutes = ZupiRoutes;
