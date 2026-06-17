package senai.tcc.zupiapi.zupibackend.dto.response;

public record GoogleAuthResponse(
        String status,
        String message,
        String token,
        UserResponse user,
        PendingGoogleUserResponse pendingUser
) {
}
