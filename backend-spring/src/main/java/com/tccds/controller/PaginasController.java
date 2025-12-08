package com.tccds.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller para navegar entre as páginas HTML do frontend
 */
@Controller
@RequestMapping("/")
public class PaginasController {
    
    @GetMapping("")
    public String index() {
        return "redirect:/pages/index.html";
    }
    
    @GetMapping("index")
    public String homeIndex() {
        return "redirect:/pages/index.html";
    }
    
    @GetMapping("login")
    public String login() {
        return "redirect:/pages/login.html";
    }
    
    @GetMapping("cadastro")
    public String cadastro() {
        return "redirect:/pages/cadastro.html";
    }

    @GetMapping("inicio")
    public String inicio() {
        return "redirect:/pages/inicio.html";
    }
    
    @GetMapping("selecao-perfil")
    public String selecaoPerfil() {
        return "redirect:/pages/selecao-perfil.html";
    }
    
    @GetMapping("dashboard")
    public String dashboard() {
        return "redirect:/pages/dashboard-pais.html";
    }
    
    @GetMapping("dashboard-pais")
    public String dashboardPais() {
        return "redirect:/pages/dashboard-pais.html";
    }
    
    @GetMapping("menu-jogos")
    public String menuJogos() {
        return "redirect:/pages/menu-jogos.html";
    }
    
    // rota /jogo removida porque a página genérica foi excluída
    
    @GetMapping("jogo-memoria")
    public String jogoMemoria() {
        return "redirect:/pages/jogo-memoria.html";
    }
    
    @GetMapping("relatorios")
    public String relatorios() {
        return "redirect:/pages/relatorios.html";
    }
    
    @GetMapping("perfil-criancas")
    public String perfilCriancas() {
        return "redirect:/pages/perfil-criancas.html";
    }
    
    @GetMapping("configuracoes")
    public String configuracoes() {
        return "redirect:/pages/configuracoes.html";
    }
    
    @GetMapping("planos")
    public String planos() {
        return "redirect:/pages/planos.html";
    }
    
    @GetMapping("plano-gratis")
    public String planoGratis() {
        return "redirect:/pages/plano-gratis.html";
    }
    
    @GetMapping("plano-premium")
    public String planoPremium() {
        return "redirect:/pages/plano-premium.html";
    }
    
    @GetMapping("plano-pro")
    public String planoPro() {
        return "redirect:/pages/plano-pro.html";
    }
    
    @GetMapping("pagamento")
    public String pagamento() {
        return "redirect:/pages/pagamento.html";
    }
    
    @GetMapping("videos")
    public String videos() {
        return "redirect:/pages/videos.html";
    }
    
    @GetMapping("recompensas")
    public String recompensas() {
        return "redirect:/pages/recompensas.html";
    }
    
    @GetMapping("agenda")
    public String agenda() {
        return "redirect:/pages/agenda.html";
    }
    
    @GetMapping("sobre")
    public String sobre() {
        return "redirect:/pages/sobre.html";
    }
    
    @GetMapping("contato")
    public String contato() {
        return "redirect:/pages/contato.html";
    }
    
    @GetMapping("erro")
    public String erro() {
        return "redirect:/pages/erro.html";
    }
    
    @GetMapping("zupi")
    public String zupi() {
        return "redirect:/pages/zupi.html";
    }
}
