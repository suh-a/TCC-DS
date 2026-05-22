package senai.tcc.zupiapi.zupibackend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long expirationMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username) {
        return generateToken(username, null, null);
    }

    public String generateToken(String username, Long userId, UserType userType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate);

        if (userId != null) {
            builder.claim("userId", userId);
        }
        if (userType != null) {
            builder.claim("userType", userType.name());
        }

        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Object userId = getClaims(token).get("userId");
        if (userId instanceof Number) {
            return ((Number) userId).longValue();
        }
        return null;
    }

    public String getUserTypeFromToken(String token) {
        return (String) getClaims(token).get("userType");
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
