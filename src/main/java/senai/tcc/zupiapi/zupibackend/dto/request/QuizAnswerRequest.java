package senai.tcc.zupiapi.zupibackend.dto.request;

import java.util.Map;

public record QuizAnswerRequest(
        Long childId,
        Map<String, String> answers
) {
}
