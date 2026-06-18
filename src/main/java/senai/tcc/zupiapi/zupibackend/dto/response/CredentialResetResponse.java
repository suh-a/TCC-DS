package senai.tcc.zupiapi.zupibackend.dto.response;

public record CredentialResetResponse(
        Long id,
        String email,
        String generatedPassword
) {
}
