package senai.tcc.zupiapi.zupibackend.dto.response;

import senai.tcc.zupiapi.zupibackend.model.User;

public record UserResponse(
        Long id,
        String name,
        String email
) {
}
