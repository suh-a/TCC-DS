/**
 * API Service - Exemplo de como conectar o frontend com o backend
 * 
 * Use este arquivo como referência para fazer requisições HTTP para o backend Spring Boot
 * 
 * Copie este arquivo para: src/js/api-service.js
 */

const API_BASE_URL = 'http://localhost:8080/api';

// ==================== USUÁRIOS ====================

/**
 * Registrar novo usuário
 */
async function registrarUsuario(email, senha, nome, tipoPlano = 'gratis') {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                senha,
                nome,
                tipoPlano
            })
        });
        
        if (!response.ok) throw new Error('Erro ao registrar usuário');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Login de usuário
 */
async function loginUsuario(email, senha) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                senha
            })
        });
        
        if (!response.ok) throw new Error('Email ou senha incorretos');
        const usuario = await response.json();
        
        // Salvar usuário no localStorage
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        return usuario;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Obter usuário por ID
 */
async function obterUsuario(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Usuário não encontrado');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Atualizar usuário
 */
async function atualizarUsuario(id, nome, tipoPlano) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome,
                tipoPlano
            })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar usuário');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// ==================== CRIANÇAS ====================

/**
 * Criar nova criança
 */
async function criarCrianca(usuarioId, nome, idade, dataNascimento) {
    try {
        const response = await fetch(`${API_BASE_URL}/criancas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuarioId,
                nome,
                idade,
                dataNascimento
            })
        });
        
        if (!response.ok) throw new Error('Erro ao criar criança');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Obter crianças de um usuário
 */
async function obterCriancasDoUsuario(usuarioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/criancas/usuario/${usuarioId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Erro ao obter crianças');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Obter criança por ID
 */
async function obterCrianca(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/criancas/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Criança não encontrada');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Atualizar criança
 */
async function atualizarCrianca(id, nome, idade, dataNascimento) {
    try {
        const response = await fetch(`${API_BASE_URL}/criancas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome,
                idade,
                dataNascimento
            })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar criança');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// ==================== PLANOS ====================

/**
 * Obter todos os planos
 */
async function obterTodosOsPlanos() {
    try {
        const response = await fetch(`${API_BASE_URL}/planos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Erro ao obter planos');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Obter plano por tipo
 */
async function obterPlanoPorTipo(tipo) {
    try {
        const response = await fetch(`${API_BASE_URL}/planos/tipo/${tipo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Plano não encontrado');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// ==================== RELATÓRIOS ====================

/**
 * Registrar sessão de jogo
 */
async function registrarJogo(criancaId, usuarioId, tempoJogado, acertos, erros, pontuacao, tipoJogo) {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                criancaId,
                usuarioId,
                tempoJogado,
                acertos,
                erros,
                pontuacao,
                tipoJogo
            })
        });
        
        if (!response.ok) throw new Error('Erro ao registrar jogo');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Obter relatórios de uma criança
 */
async function obterRelatoriosDaCrianca(criancaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios/crianca/${criancaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Erro ao obter relatórios');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

/**
 * Obter relatórios de um usuário
 */
async function obterRelatoriosDoUsuario(usuarioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios/usuario/${usuarioId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Erro ao obter relatórios');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

// ==================== UTILITÁRIOS ====================

/**
 * Obter usuário logado do localStorage
 */
function obterUsuarioLogado() {
    const usuarioJSON = localStorage.getItem('usuarioLogado');
    return usuarioJSON ? JSON.parse(usuarioJSON) : null;
}

/**
 * Logout - remover usuário do localStorage
 */
function logout() {
    localStorage.removeItem('usuarioLogado');
}

/**
 * Verificar se há usuário logado
 */
function temUsuarioLogado() {
    return obterUsuarioLogado() !== null;
}

// ==================== EXEMPLOS DE USO ====================

/*
// Exemplo 1: Registrar novo usuário
registrarUsuario('pai@example.com', 'senha123', 'João Silva', 'gratis')
    .then(usuario => console.log('Usuário registrado:', usuario))
    .catch(erro => console.error(erro));

// Exemplo 2: Fazer login
loginUsuario('pai@example.com', 'senha123')
    .then(usuario => {
        console.log('Usuário logado:', usuario);
        console.log('ID do usuário:', usuario.id);
    })
    .catch(erro => console.error(erro));

// Exemplo 3: Criar criança
const usuarioLogado = obterUsuarioLogado();
if (usuarioLogado) {
    criarCrianca(usuarioLogado.id, 'Maria', 6, '2018-05-15')
        .then(crianca => console.log('Criança criada:', crianca))
        .catch(erro => console.error(erro));
}

// Exemplo 4: Obter planos
obterTodosOsPlanos()
    .then(planos => console.log('Planos disponíveis:', planos))
    .catch(erro => console.error(erro));

// Exemplo 5: Registrar jogo
registrarJogo(1, 1, 15, 8, 2, 80, 'memoria')
    .then(relatorio => console.log('Jogo registrado:', relatorio))
    .catch(erro => console.error(erro));
*/
