package senai.tcc.zupiapi.zupibackend.dto.response;

public record TeacherResponse(
        Long id,
        String name,
        String email,
        String specialty,
        String profilePhotoUrl,
        Long accountId,
        String generatedPassword
) {
}
