package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDateTime;

public record SchoolReportStudentResponse(
        Long childId,
        String name,
        String schoolClass,
        long totalSessions,
        long averageScore,
        LocalDateTime lastPlayedAt
) {
}
