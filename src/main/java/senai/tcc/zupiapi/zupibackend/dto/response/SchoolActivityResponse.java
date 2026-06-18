package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SchoolActivityResponse(
        Long id,
        Long classId,
        String className,
        String title,
        String description,
        String link,
        LocalDate deadline,
        LocalDateTime createdAt
) {
}
