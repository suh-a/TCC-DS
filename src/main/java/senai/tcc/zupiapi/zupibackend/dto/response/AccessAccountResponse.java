package senai.tcc.zupiapi.zupibackend.dto.response;

public record AccessAccountResponse(
        Long id,
        Long accountId,
        String name,
        String email,
        String role,
        String extra
) {
}
