package senai.tcc.zupiapi.zupibackend.dto;


import senai.tcc.zupiapi.zupibackend.model.SkillArea;

public record ChildScoresAveragesByAreaDTO(
        SkillArea skillArea,
        Double average
) {

}
