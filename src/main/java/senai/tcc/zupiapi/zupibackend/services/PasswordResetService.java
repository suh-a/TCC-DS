package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.request.PasswordChangeRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.PasswordResetRequest;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.PasswordResetToken;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.repositories.PasswordResetTokenRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Value("${zupi.app.base-url:http://localhost:8080}")
    private String baseUrl;

    public void requestReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("E-mail não encontrado"));

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUser(user);
        token.setUsed(false);
        tokenRepository.save(token);

        String link = baseUrl + "/redefinir-senha?token=" + token.getToken();
        emailService.sendPasswordResetEmail(user.getEmail(), link);
    }

    public void resetPassword(PasswordChangeRequest request) {
        PasswordResetToken token = tokenRepository.findByTokenAndUsedFalse(request.token())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado");
        }

        userService.resetPasswordDirect(token.getUser().getId(), request.newPassword());
        token.setUsed(true);
        tokenRepository.save(token);
    }
}
