package com.tccds.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir arquivos estáticos do frontend diretamente do diretório original
        // Suporta URLs que usam o prefixo /src/... (caminho antigo) e caminhos sem o prefixo
        registry.addResourceHandler("/src/**")
            .addResourceLocations("file:/home/suellen/TCC-DS/src/");

        // Fallback para arquivos estáticos no diretório do frontend
        registry.addResourceHandler("/**")
            .addResourceLocations("file:/home/suellen/TCC-DS/src/");
    }
}
