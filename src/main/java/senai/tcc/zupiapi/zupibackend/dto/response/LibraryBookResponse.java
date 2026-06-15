package senai.tcc.zupiapi.zupibackend.dto.response;

public record LibraryBookResponse(
        Long id,
        String title,
        String fileUrl
) {
}
