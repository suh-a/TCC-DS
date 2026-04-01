package senai.tcc.zupiapi.zupibackend.dto.response;

import java.time.LocalDate;

public record ChildResponse(
        Long id,
        String name,
        LocalDate birthDate,
        String schoolClass,
        String condition,
        Integer age
) {

}
