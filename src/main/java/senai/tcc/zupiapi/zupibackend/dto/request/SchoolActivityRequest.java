package senai.tcc.zupiapi.zupibackend.dto.request;

import java.time.LocalDate;

public record SchoolActivityRequest(
        Long classId,
        String title,
        String description,
        String link,
        LocalDate deadline
) {
}
