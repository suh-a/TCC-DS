package senai.tcc.zupiapi.zupibackend.dto.response;

import java.util.List;

public record SchoolAccessSummaryResponse(
        List<AccessAccountResponse> responsibles,
        List<AccessAccountResponse> teachers,
        List<AccessAccountResponse> students
) {
}
