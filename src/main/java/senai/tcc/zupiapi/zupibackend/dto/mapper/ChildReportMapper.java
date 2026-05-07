package senai.tcc.zupiapi.zupibackend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportResponse;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;

import java.util.List;

@Mapper(componentModel = "spring",uses = ChildReportScoreMapper.class)
public interface ChildReportMapper {

    ChildReportResponse toResponse(ChildReport childReport);

    List<ChildReportResponse> toResponseList(List<ChildReport> childReports);
}
