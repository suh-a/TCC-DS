package senai.tcc.zupiapi.zupibackend.dto;

import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;

public record LoginResponse(
        String token,
        UserResponse user
) {
}
