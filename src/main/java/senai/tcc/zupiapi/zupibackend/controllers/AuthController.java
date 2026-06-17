package senai.tcc.zupiapi.zupibackend.controllers;

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

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(googleAuthService.login(request.getToken()));
    }
}
