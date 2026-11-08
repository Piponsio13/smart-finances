package io.github.piponsio.smartfinances_api.service.auth;

import io.github.piponsio.smartfinances_api.dto.request.LoginRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.LoginReponseDto;

public interface LoginService {
    LoginReponseDto login(LoginRequestDto loginRequest);
}