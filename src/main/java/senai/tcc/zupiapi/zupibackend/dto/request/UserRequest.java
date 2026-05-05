package senai.tcc.zupiapi.zupibackend.dto.request;

public record UserRequest(
        String name,
        String email,
        String password
) {

}
