package senai.tcc.zupiapi.zupibackend.dto.response;

import java.util.List;

public record SchoolReportSummaryResponse(
        long totalStudents,
        long totalSessions,
        long averageScore,
        List<SchoolReportStudentResponse> students
) {
}
