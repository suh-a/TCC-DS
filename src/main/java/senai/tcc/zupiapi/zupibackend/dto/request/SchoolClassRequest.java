package senai.tcc.zupiapi.zupibackend.dto.request;

public record SchoolClassRequest(
        String name,
        Long teacherId
) {
}
