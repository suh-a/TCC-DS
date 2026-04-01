package senai.tcc.zupiapi.zupibackend.dto;


import senai.tcc.zupiapi.zupibackend.model.SkillArea;

public record ChildScoresAvaregesByAreaDTO(
        SkillArea skillArea,
        Double average
) {

}
