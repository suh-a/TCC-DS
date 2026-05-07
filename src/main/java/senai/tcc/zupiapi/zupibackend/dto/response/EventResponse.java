package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;

import java.time.Instant;
import java.time.LocalDate;

public record EventResponse(
        Long id,
        String title,
        Instant date,
        Instant finish,
        SkillArea skillArea,
        Child child
) {
}
