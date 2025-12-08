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
        return "redirect:/index.html";
    }
    
    @GetMapping("index")
    public String homeIndex() {
        return "redirect:/index.html";
    }
    
    @GetMapping("login")
    public String login() {
        return "redirect:/login.html";
    }
    
    @GetMapping("cadastro")
    public String cadastro() {
        return "redirect:/cadastro.html";
    }
    
    @GetMapping("selecao-perfil")
    public String selecaoPerfil() {
        return "redirect:/selecao-perfil.html";
    }
    
    @GetMapping("dashboard")
    public String dashboard() {
        return "redirect:/dashboard-pais.html";
    }
    
    @GetMapping("dashboard-pais")
    public String dashboardPais() {
        return "redirect:/dashboard-pais.html";
    }
    
    @GetMapping("menu-jogos")
    public String menuJogos() {
        return "redirect:/menu-jogos.html";
    }
    
    @GetMapping("jogo")
    public String jogo() {
        return "redirect:/jogo.html";
    }
    
    @GetMapping("jogo-memoria")
    public String jogoMemoria() {
        return "redirect:/jogo-memoria.html";
    }
    
    @GetMapping("relatorios")
    public String relatorios() {
        return "redirect:/relatorios.html";
    }
    
    @GetMapping("perfil-criancas")
    public String perfilCriancas() {
        return "redirect:/perfil-criancas.html";
    }
    
    @GetMapping("configuracoes")
    public String configuracoes() {
        return "redirect:/configuracoes.html";
    }
    
    @GetMapping("planos")
    public String planos() {
        return "redirect:/planos.html";
    }
    
    @GetMapping("plano-gratis")
    public String planoGratis() {
        return "redirect:/plano-gratis.html";
    }
    
    @GetMapping("plano-premium")
    public String planoPremium() {
        return "redirect:/plano-premium.html";
    }
    
    @GetMapping("plano-pro")
    public String planoPro() {
        return "redirect:/plano-pro.html";
    }
    
    @GetMapping("pagamento")
    public String pagamento() {
        return "redirect:/pagamento.html";
    }
    
    @GetMapping("videos")
    public String videos() {
        return "redirect:/videos.html";
    }
    
    @GetMapping("recompensas")
    public String recompensas() {
        return "redirect:/recompensas.html";
    }
    
    @GetMapping("agenda")
    public String agenda() {
        return "redirect:/agenda.html";
    }
    
    @GetMapping("sobre")
    public String sobre() {
        return "redirect:/sobre.html";
    }
    
    @GetMapping("contato")
    public String contato() {
        return "redirect:/contato.html";
    }
    
    @GetMapping("erro")
    public String erro() {
        return "redirect:/erro.html";
    }
    
    @GetMapping("zupi")
    public String zupi() {
        return "redirect:/zupi.html";
    }
}
