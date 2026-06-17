package senai.tcc.zupiapi.zupibackend.security.oauth2;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class GoogleOAuth2StartLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2StartLoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if ("/oauth2/authorization/google".equals(request.getRequestURI())) {
            log.info("OAuth2 login Google iniciado");
        }
        filterChain.doFilter(request, response);
    }
}
