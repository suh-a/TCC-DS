package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import senai.tcc.zupiapi.zupibackend.dto.request.GoogleAuthRequest;
import senai.tcc.zupiapi.zupibackend.services.GoogleAuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private GoogleAuthService googleAuthService;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @RequestBody GoogleAuthRequest request
    ) {

        try {

            var payload =
                    googleAuthService.verifyToken(request.getToken());

            if (payload == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Token inválido");
            }

            String email = payload.getEmail();
            String nome = (String) payload.get("name");

            // verificar usuário no banco
            // criar se não existir
            // gerar JWT

            return ResponseEntity.ok().body(email);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Erro no login Google");
        }
    }
}
