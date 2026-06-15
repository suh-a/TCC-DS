package senai.tcc.zupiapi.zupibackend.dto.response;

import java.util.List;

public record SchoolAccessResponse(
        List<AccessItemResponse> responsibles,
        List<AccessItemResponse> teachers,
        List<AccessItemResponse> students
) {
}
