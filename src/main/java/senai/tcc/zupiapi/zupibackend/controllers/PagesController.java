package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class PagesController {
    @GetMapping("/")
    public String homepage() {
        return "index";
    }
    @GetMapping("/login") public String login() { return "login"; }
    @GetMapping("/cadastro") public String cadastro() { return "cadastro"; }
    @GetMapping("/dashboard") public String dashboard() { return "dashboard-pais"; }
    @GetMapping("/selecao-perfil") public String selecaoPerfil() { return "selecao-perfil"; }
    @GetMapping("/relatorios") public String relatorios() { return "relatorios"; }
    @GetMapping("/perfil") public String perfil() { return "perfil-criancas"; }
    @GetMapping("/agenda") public String agenda() { return "agenda"; }
    @GetMapping("/sobre") public String sobre() { return "sobre"; }
    @GetMapping("/planos") public String planos() { return "planos"; }
    @GetMapping("/contatos") public String contatos() { return "contato"; }
    @GetMapping("/configuracoes") public String configuracoes() { return "configuracoes"; }
    @GetMapping("/atividades-interativas") public String atividades() { return "atividades-interativas"; }
    @GetMapping("/guia-casa") public String guiaCasa() { return "guia-casa"; }
    @GetMapping("/desafios-semanais") public String desafios() { return "desafios-semanais"; }
    @GetMapping("/dicas-inclusao") public String dicas() { return "dicas-inclusao"; }
    @GetMapping("/biblioteca") public String biblioteca() { return "biblioteca"; }
    @GetMapping("/feed") public String feed() { return "feed"; }
    @GetMapping("/redefinir-senha") public String redefinirSenha() { return "redefinir-senha"; }
    @GetMapping("/esqueci-senha") public String esqueciSenha() { return "esqueci-senha"; }
    @GetMapping("/cadastro-escola") public String cadastroEscola() { return "cadastro-escola"; }
    @GetMapping("/dashboard-escola") public String dashboardEscola() { return "dashboard-escola"; }
    @GetMapping("/onboarding-crianca") public String onboarding(@RequestParam(required = false) Long childId, Model model) {
        model.addAttribute("childId", childId);
        return "onboarding-crianca";
    }
    @GetMapping("/pagamento") public String pagamento(@RequestParam(required = false) String plano, Model model) {
        model.addAttribute("plano", plano != null ? plano : "pessoa-fisica");
        return "pagamento";
    }
    // JOGOS
    @GetMapping("/menuJogos") public String menuJogos() { return "menuJogos"; }
    @GetMapping("/jogoMemoria") public String jogoMemoria() { return "jogoMemoria"; }
    @GetMapping("/JogoLigarObjetos") public String jogoLigarObjetos() { return "jogo-ligar-objetos"; }
    @GetMapping("/jogoCoresFormas") public String jogoCoresFormas() { return "jogo-cores-formas"; }
    @GetMapping("/jogoMath") public String jogoMath() { return "JogoMath"; }
    @GetMapping("/jogoBolhas") public String jogoBolhas() { return "jogoBolhas"; }
    @GetMapping("/jogoSequencia") public String jogoSequencia() { return "jogoSequencia"; }
    @GetMapping("/jogoPalavras") public String jogoPalavras() { return "jogoPalavras"; }
    @GetMapping("/jogoColorir") public String jogoColorir() { return "jogoColorir"; }
    @GetMapping("/jogoClique") public String jogoClique() { return "jogoClique"; }
    @GetMapping("/jogoContagem") public String jogoContagem() { return "jogoContagem"; }
    @GetMapping("/jogoOrdem") public String jogoOrdem() { return "jogoOrdem"; }
    @GetMapping("/jogoSombras") public String jogoSombras() { return "jogoSombras"; }
    @GetMapping("/jogoBomba") public String jogoBomba() { return "jogoBomba"; }
    @GetMapping("/jogoBalao") public String jogoBalao() { return "jogoBalao"; }
    @GetMapping("/jogoPintura") public String jogoPintura() { return "jogoPintura"; }
}
