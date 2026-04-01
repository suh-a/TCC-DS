package senai.tcc.zupiapi.zupibackend.dto.request;

import java.time.Instant;

public record EventRequest(
        String title,
        Instant date,
        Instant finish,
        Long childId,
        Long skillAreaId,
        Long userId
) {

}
