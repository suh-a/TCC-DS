package senai.tcc.zupiapi.zupibackend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportScoreRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportScoreResponse;
import senai.tcc.zupiapi.zupibackend.model.ChildReportScore;

@Mapper(componentModel = "spring", uses = SkillAreaMapper.class)
public interface ChildReportScoreMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "childReport",ignore = true)
    @Mapping(target = "skillArea",ignore = true)
    ChildReportScore toEntity(ChildReportScoreRequest request);

    @Mapping(target = "theme", source = "skillArea")
    ChildReportScoreResponse toResponse(ChildReportScore entity);
}
