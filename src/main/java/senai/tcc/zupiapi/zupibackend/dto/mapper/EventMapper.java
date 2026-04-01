package senai.tcc.zupiapi.zupibackend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import senai.tcc.zupiapi.zupibackend.dto.request.EventRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.EventResponse;
import senai.tcc.zupiapi.zupibackend.model.Event;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    EventResponse toResponse(Event event);

    @Mapping(target = "skillArea",ignore = true)
    @Mapping(target = "child",ignore = true)
    @Mapping(target = "user",ignore = true)
    @Mapping(target = "id",ignore = true)
    Event toEntity(EventRequest event);

    List<EventResponse> toResponseList(List<Event> events);
}
