package senai.tcc.zupiapi.zupibackend.dto.request;

public record SchoolQuizRequest(
        Long classId,
        String title,
        String description,
        String questionsJson
) {
}
