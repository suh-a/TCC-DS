package senai.tcc.zupiapi.zupibackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import senai.tcc.zupiapi.zupibackend.security.JwtAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Static resources
                        .requestMatchers(
                                "/css/**", "/js/**", "/img/**", "/images/**",
                                "/assets/**", "/static/**", "/webjars/**", "/audio/**",
                                "/favicon.ico", "/h2-console/**"
                        ).permitAll()
                        // Public pages and auth endpoints
                        .requestMatchers(
                                "/", "/login", "/cadastro", "/sobre",
                                "/planos", "/contatos", "/erro",
                                "/esqueci-senha", "/redefinir-senha", "/cadastro-escola",
                                "/pagamento", "/auth/register", "/auth/login", "/auth/google",
                                "/auth/forgot-password", "/auth/reset-password",
                                "/support/**", "/video/**",
                                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"
                        ).permitAll()
                        // WebSocket
                        .requestMatchers("/websocket/**", "/ws/**").permitAll()
                        // Authenticated API routes
                        .requestMatchers("/child/**", "/quiz/**", "/content/**", "/skillAreas").authenticated()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Dashboard pages — require authentication
                        .requestMatchers("/dashboard", "/dashboard-crianca", "/dashboard-aluno",
                                "/selecao-perfil", "/selecao-relatorios", "/agenda", "/relatorios", "/perfil",
                                "/perfil-responsavel", "/perfil-crianca", "/configuracoes",
                                "/cadastro-dependentes", "/ajuda", "/recompensas",
                                "/biblioteca", "/feed", "/dicas-inclusao",
                                "/guia-casa", "/atividades-interativas", "/desafios-semanais",
                                "/onboarding-crianca").authenticated()
                        .requestMatchers("/dashboard-escola").hasRole("ESCOLA")
                        .requestMatchers("/dashboard-docente").hasRole("DOCENTE")
                        .requestMatchers("/dashboard-admin").hasRole("ADMIN")
                        // Game pages — authenticated
                        .requestMatchers("/menuJogos", "/jogoMemoria", "/JogoLigarObjetos",
                                "/jogoCoresFormas", "/jogoMath", "/jogoBolhas",
                                "/jogoSequencia", "/jogoPalavras", "/jogoColorir",
                                "/jogoClique", "/jogoContagem", "/jogoOrdem",
                                "/jogoSombras", "/jogoBomba", "/jogoBalao",
                                "/jogoPintura").authenticated()
                        // All other authenticated endpoints
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}
