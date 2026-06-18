package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDateTime;

public record SchoolQuizResponse(
        Long id,
        Long classId,
        String className,
        String title,
        String description,
        String questionsJson,
        LocalDateTime createdAt
) {
}
