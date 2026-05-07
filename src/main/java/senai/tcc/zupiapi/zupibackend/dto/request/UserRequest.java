package senai.tcc.zupiapi.zupibackend.dto.request;

import senai.tcc.zupiapi.zupibackend.model.User;

public record UserRequest(
        String name,
        String email,
        String password
) {

}
