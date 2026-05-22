package senai.tcc.zupiapi.zupibackend.dto.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import senai.tcc.zupiapi.zupibackend.dto.request.UserRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.model.User;

import java.util.List;


@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "children", ignore = true)
    @Mapping(target = "events", ignore = true)
    @Mapping(target = "twoFactorEnabled", ignore = true)
    @Mapping(target = "profilePhotoUrl", ignore = true)
    @Mapping(target = "active", ignore = true)

    @Mapping(target = "address", ignore = true)
    User toEntity(UserRequest userRequest);

    @Mapping(target = "address", expression = "java(user.getAddress() != null ? user.getAddress().toString() : null)")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

}
