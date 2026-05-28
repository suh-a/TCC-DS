package senai.tcc.zupiapi.zupibackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class ZupibackendApplication {

    public static void main(String[] args) {
        configureRenderDatabaseUrl();
        SpringApplication.run(ZupibackendApplication.class, args);
    }

    private static void configureRenderDatabaseUrl() {
        if (hasText(System.getProperty("spring.datasource.url")) || hasText(System.getenv("SPRING_DATASOURCE_URL"))) {
            return;
        }

        String databaseUrl = System.getenv("DATABASE_URL");
        if (!hasText(databaseUrl)) {
            return;
        }

        if (databaseUrl.startsWith("jdbc:")) {
            System.setProperty("spring.datasource.url", databaseUrl);
            return;
        }

        if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
            return;
        }

        URI uri = URI.create(databaseUrl);
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(uri.getHost());

        if (uri.getPort() > 0) {
            jdbcUrl.append(":").append(uri.getPort());
        }

        jdbcUrl.append(uri.getPath());

        if (hasText(uri.getQuery())) {
            jdbcUrl.append("?").append(uri.getQuery());
        }

        System.setProperty("spring.datasource.url", jdbcUrl.toString());

        String userInfo = uri.getUserInfo();
        if (hasText(userInfo)) {
            String[] credentials = userInfo.split(":", 2);
            setIfMissing("spring.datasource.username", "SPRING_DATASOURCE_USERNAME", decode(credentials[0]));
            if (credentials.length > 1) {
                setIfMissing("spring.datasource.password", "SPRING_DATASOURCE_PASSWORD", decode(credentials[1]));
            }
        }
    }

    private static void setIfMissing(String propertyName, String envName, String value) {
        if (!hasText(System.getProperty(propertyName)) && !hasText(System.getenv(envName)) && hasText(value)) {
            System.setProperty(propertyName, value);
        }
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
