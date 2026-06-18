package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record QuizResponse(
        Long id,
        Long childId,
        LocalDateTime createdAt,
        boolean completed,
        List<String> questions,
        Map<String, String> answers,
        String summary,
        String childLoginEmail,
        String generatedPassword
) {
}
