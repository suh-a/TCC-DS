package senai.tcc.zupiapi.zupibackend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.model.Child;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChildMapper {

    @Mapping(target = "activits", ignore = true)
    @Mapping(target = "responsible", ignore = true)
    @Mapping(target = "reports", ignore = true)
    Child toEntity(ChildRequest request);


    ChildResponse toResponse(Child child);

    List<ChildResponse> toResponseList(List<Child> children);
}
