package senai.tcc.zupiapi.zupibackend.dto.response;

public record ResponsibleSummaryResponse(
        Long id,
        String name,
        String email,
        String cpf,
        String phone
) {
}
