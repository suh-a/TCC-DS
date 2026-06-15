package senai.tcc.zupiapi.zupibackend.dto.response;

public record SchoolClassResponse(
        Long id,
        String name,
        Long teacherId,
        String teacherName
) {
}
