package io.github.piponsio.smartfinances_api.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginReponseDto {
    private String token;
    private String name;
    private String email;
}
