package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class PagesController {

    @GetMapping("/")
    public String homepage() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/cadastro")
    public String cadastro() {
        return "cadastro";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard-pais";
    }

    @GetMapping("/selecao-perfil")
    public String selecaoPerfil() {
        return "selecao-perfil";
    }

    @GetMapping("/relatorios")
    public String relatorios() {
        return "relatorios";
    }

    @GetMapping("/perfil")
    public String perfil() {
        return "perfil-criancas";
    }

    @GetMapping("/agenda")
    public String agenda() {
        return "agenda";
    }

    @GetMapping("/sobre")
    public String sobre() {
        return "sobre";
    }

    @GetMapping("/planos")
    public String planos() {
        return "planos";
    }

    @GetMapping("/contatos")
    public String contatos() {
        return "contato";
    }

    @GetMapping("/configuracoes")
    public String configuracoes() {
        return "configuracoes";
    }

    @GetMapping("/videos")
    public String videos() {
        return "videos";
    }

    @GetMapping("/menuJogos")
    public String menuJogos() {
        return "menuJogos";
    }

    @GetMapping("/jogoMemoria")
    public String jogoMemoria() {
        return "jogoMemoria";
    }

    @GetMapping("/JogoLigarObjetos")
    public String JogoLigarObjetos() {
        return "jogo-ligar-objetos";
    }

    @GetMapping("/jogoCoresFormas")
    public String jogoCoresFormas() {
        return "jogo-cores-formas";
    }

    @GetMapping("/jogoMath")
    public String jogoMath() {
        return "JogoMath";
    }

}
