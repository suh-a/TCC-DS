package senai.tcc.zupiapi.zupibackend.dto.response;

public record AccessItemResponse(
        Long id,
        String name,
        String email,
        String extra
) {
}
