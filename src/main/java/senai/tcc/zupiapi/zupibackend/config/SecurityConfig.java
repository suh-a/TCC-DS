package senai.tcc.zupiapi.zupibackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Recursos estáticos — sempre liberados
                .requestMatchers(
                    "/css/**", "/js/**", "/img/**", "/images/**",
                    "/assets/**", "/static/**", "/webjars/**",
                    "/favicon.ico", "/h2-console/**"
                ).permitAll()
                // Páginas públicas
                .requestMatchers(
                    "/", "/login", "/cadastro", "/sobre",
                    "/planos", "/contatos", "/erro",
                    // Todas as páginas do site
                    "/dashboard", "/selecao-perfil", "/relatorios",
                    "/perfil", "/agenda", "/configuracoes",
                    "/atividades-interativas", "/guia-casa", "/desafios-semanais",
                    "/dicas-inclusao", "/biblioteca", "/feed", "/esqueci-senha",
                    "/redefinir-senha", "/cadastro-escola", "/dashboard-escola",
                    "/onboarding-crianca", "/pagamento",
                    // Menu e todos os jogos
                    "/menuJogos",
                    "/jogoMemoria", "/JogoLigarObjetos", "/jogoCoresFormas",
                    "/jogoMath", "/jogoBolhas", "/jogoSequencia", "/jogoPalavras",
                    "/jogoColorir", "/jogoClique", "/jogoContagem", "/jogoOrdem",
                    "/jogoSombras", "/jogoBomba", "/jogoBalao", "/jogoPintura",
                    // API endpoints
                    "/api/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"
                ).permitAll()
                // Qualquer outra rota também liberada por ora
                .anyRequest().permitAll()
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .headers(headers -> headers
                .frameOptions(frame -> frame.disable()) // para H2 console
            );

        return http.build();
    }
}
