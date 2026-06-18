package senai.tcc.zupiapi.zupibackend.dto.response;

public record SchoolDashboardResponse(
        String schoolName,
        long students,
        long teachers,
        long classes,
        long games,
        long averageScore
) {
}
