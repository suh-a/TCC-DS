package senai.tcc.zupiapi.zupibackend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.response.GoogleAuthResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.PendingGoogleUserResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;

import java.util.Collections;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final JwtUtil jwtUtil;

    public GoogleAuthService(
            UserRepository userRepository,
            ChildRepository childRepository,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.childRepository = childRepository;
        this.jwtUtil = jwtUtil;
    }

    public GoogleIdToken.Payload verifyToken(String tokenString) throws Exception {
        GoogleIdTokenVerifier verifier =
                new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                )
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

        GoogleIdToken idToken = verifier.verify(tokenString);
        return idToken == null ? null : idToken.getPayload();
    }

    public GoogleAuthResponse login(String tokenString) {
        GoogleIdToken.Payload payload = requireValidPayload(tokenString);
        String email = normalizeEmail(payload.getEmail());

        Child child = childRepository.findByChildLoginEmailIgnoreCase(email).orElse(null);
        if (child != null) {
            UserType type = child.isSchoolLinked() ? UserType.ALUNO_CREDENCIADO : UserType.CRIANCA;
            UserResponse user = new UserResponse(
                    child.getId(),
                    child.getName(),
                    child.getChildLoginEmail(),
                    child.getCpf(),
                    null,
                    null,
                    type,
                    true,
                    false,
                    child.getProfilePhotoUrl()
            );
            String token = jwtUtil.generateToken(child.getChildLoginEmail(), child.getId(), type);
            return new GoogleAuthResponse("AUTHENTICATED", "Login Google realizado", token, user, null);
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            PendingGoogleUserResponse pendingUser = new PendingGoogleUserResponse(
                    stringPayload(payload, "name"),
                    email,
                    payload.getSubject(),
                    stringPayload(payload, "picture")
            );
            return new GoogleAuthResponse(
                    "REGISTRATION_REQUIRED",
                    "Complete seu cadastro para liberar o acesso.",
                    null,
                    null,
                    pendingUser
            );
        }

        linkGoogleAccountIfNeeded(user, payload);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getPhone(),
                user.getAddress() != null ? user.getAddress().toString() : null,
                user.getUserType(),
                user.isActive(),
                user.isTwoFactorEnabled(),
                user.getProfilePhotoUrl()
        );
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getUserType());
        return new GoogleAuthResponse("AUTHENTICATED", "Login Google realizado", token, response, null);
    }

    public GoogleIdToken.Payload requireValidPayload(String tokenString) {
        try {
            GoogleIdToken.Payload payload = verifyToken(tokenString);
            if (payload == null || payload.getEmail() == null || payload.getEmail().isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token Google invalido");
            }
            return payload;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token Google invalido");
        }
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private void linkGoogleAccountIfNeeded(User user, GoogleIdToken.Payload payload) {
        boolean changed = false;
        if (!Boolean.TRUE.equals(user.getGoogleAccount())) {
            user.setGoogleAccount(true);
            changed = true;
        }
        if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
            user.setGoogleId(payload.getSubject());
            changed = true;
        }
        if (user.getProvider() == null || user.getProvider().isBlank()) {
            user.setProvider("GOOGLE");
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
        }
    }

    private static String stringPayload(GoogleIdToken.Payload payload, String key) {
        Object value = payload.get(key);
        return value == null ? null : String.valueOf(value);
    }
}
