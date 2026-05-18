package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ApiInfoController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "service", "zupi-api",
                "status", "ok",
                "docs", "/swagger-ui.html"
        );
    }
}
