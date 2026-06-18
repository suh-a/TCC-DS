package senai.tcc.zupiapi.zupibackend.dto.response;

import java.util.List;

public record WeeklyQuizResponse(
        Long id, String slug, String title, String objective, String feedback,
        List<Question> questions
) {
    public record Question(Long id, String prompt, List<String> options) {}
}
