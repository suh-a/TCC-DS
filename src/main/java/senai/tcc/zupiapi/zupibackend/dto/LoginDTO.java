package senai.tcc.zupiapi.zupibackend.dto;

import senai.tcc.zupiapi.zupibackend.model.User;

public record LoginDTO(
        String email,
        String password
) {
    public LoginDTO(User user) {
       this(
               user.getEmail(),
               user.getPassword());
    }
}
