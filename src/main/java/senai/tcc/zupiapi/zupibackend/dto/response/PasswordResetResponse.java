package senai.tcc.zupiapi.zupibackend.dto.response;

public record PasswordResetResponse(
        String email,
        String generatedPassword
) {
}
