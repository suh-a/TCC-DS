package senai.tcc.zupiapi.zupibackend.dto.request;

public record TeacherRequest(
        String name,
        String email,
        String specialty
) {
}
