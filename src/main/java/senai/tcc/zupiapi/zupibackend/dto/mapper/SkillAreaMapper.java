package senai.tcc.zupiapi.zupibackend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import senai.tcc.zupiapi.zupibackend.dto.request.SkillAreaRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.SkillAreaResponse;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SkillAreaMapper {

    @Mapping(target = "id", ignore = true)
    SkillArea toEntity(SkillAreaRequest request);

    SkillAreaResponse toResponse(SkillArea skillArea);

    List<SkillAreaResponse> toResponse(List<SkillArea> skillAreas);
}
