package senai.tcc.zupiapi.zupibackend.dto.request;

import senai.tcc.zupiapi.zupibackend.model.Child;

import java.time.LocalDate;

public record ChildRequest(
        String name,
        LocalDate birthDate,
        String schoolClass,
        String condition,
        Long responsibleId
) {
}
