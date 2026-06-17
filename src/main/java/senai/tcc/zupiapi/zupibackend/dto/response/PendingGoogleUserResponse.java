package senai.tcc.zupiapi.zupibackend.dto.response;

public record PendingGoogleUserResponse(
        String name,
        String email,
        String googleId,
        String picture
) {
}
