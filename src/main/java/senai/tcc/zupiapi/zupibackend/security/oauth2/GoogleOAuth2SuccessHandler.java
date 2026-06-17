package senai.tcc.zupiapi.zupibackend.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;
import senai.tcc.zupiapi.zupibackend.security.jwt.JwtUtil;
import senai.tcc.zupiapi.zupibackend.services.GoogleAuthService;

import java.io.IOException;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final JwtUtil jwtUtil;
    private final String frontendBaseUrl;

    public GoogleOAuth2SuccessHandler(
            UserRepository userRepository,
            ChildRepository childRepository,
            JwtUtil jwtUtil,
            @Value("${zupi.app.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.userRepository = userRepository;
        this.childRepository = childRepository;
        this.jwtUtil = jwtUtil;
        this.frontendBaseUrl = frontendBaseUrl.replaceAll("/$", "");
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        log.info("OAuth2 sucesso");

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = GoogleAuthService.normalizeEmail(oauthUser.getAttribute("email"));
        String name = oauthUser.getAttribute("name");
        String googleId = oauthUser.getName();
        String picture = oauthUser.getAttribute("picture");

        log.info("E-mail retornado pelo Google: {}", email);

        Child child = childRepository.findByChildLoginEmailIgnoreCase(email).orElse(null);
        if (child != null) {
            UserType role = child.isSchoolLinked() ? UserType.ALUNO_CREDENCIADO : UserType.CRIANCA;
            String token = jwtUtil.generateToken(child.getChildLoginEmail(), child.getId(), role);
            String redirectUrl = authenticatedRedirect(token, child.getId(), child.getName(), child.getChildLoginEmail(), role, null);
            log.info("Usuario encontrado como crianca/aluno. Role: {}. URL final de redirect: {}", role, redirectUrl);
            response.sendRedirect(redirectUrl);
            return;
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            String pendingToken = jwtUtil.generateToken(email);
            String redirectUrl = UriComponentsBuilder
                    .fromHttpUrl(frontendBaseUrl + "/cadastro")
                    .queryParam("google", "1")
                    .queryParam("email", email)
                    .queryParam("name", name)
                    .queryParam("googleId", googleId)
                    .queryParam("picture", picture)
                    .queryParam("googleToken", pendingToken)
                    .build()
                    .encode()
                    .toUriString();
            log.info("Usuario nao encontrado. URL final de redirect: {}", redirectUrl);
            response.sendRedirect(redirectUrl);
            return;
        }

        linkGoogleAccountIfNeeded(user, googleId, picture);
        UserType effectiveType = effectiveUserType(user);
        PlanType effectivePlanType = effectiveType == UserType.RESPONSAVEL_CREDENCIADO
                ? PlanType.PESSOA_JURIDICA
                : user.getPlanType();
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), effectiveType);
        String redirectUrl = authenticatedRedirect(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                effectiveType,
                effectivePlanType == null ? null : effectivePlanType.name()
        );
        log.info("Usuario encontrado. Role: {}. URL final de redirect: {}", effectiveType, redirectUrl);
        response.sendRedirect(redirectUrl);
    }

    private String authenticatedRedirect(
            String token,
            Long userId,
            String name,
            String email,
            UserType role,
            String planType
    ) {
        return UriComponentsBuilder
                .fromHttpUrl(frontendBaseUrl + "/oauth-success")
                .queryParam("token", token)
                .queryParam("userId", userId)
                .queryParam("name", name)
                .queryParam("email", email)
                .queryParam("role", role.name())
                .queryParam("planType", planType)
                .build()
                .encode()
                .toUriString();
    }

    private void linkGoogleAccountIfNeeded(User user, String googleId, String picture) {
        boolean changed = false;
        if (!Boolean.TRUE.equals(user.getGoogleAccount())) {
            user.setGoogleAccount(true);
            changed = true;
        }
        if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
            user.setGoogleId(googleId);
            changed = true;
        }
        if (user.getProvider() == null || user.getProvider().isBlank()) {
            user.setProvider("GOOGLE");
            changed = true;
        }
        if ((user.getProfilePhotoUrl() == null || user.getProfilePhotoUrl().isBlank()) && picture != null && !picture.isBlank()) {
            user.setProfilePhotoUrl(picture);
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
        }
    }

    private UserType effectiveUserType(User user) {
        if (user.getUserType() == UserType.RESPONSAVEL
                && childRepository.findByResponsibleId(user.getId()).stream().anyMatch(Child::isSchoolLinked)) {
            return UserType.RESPONSAVEL_CREDENCIADO;
        }
        return user.getUserType();
    }
}
