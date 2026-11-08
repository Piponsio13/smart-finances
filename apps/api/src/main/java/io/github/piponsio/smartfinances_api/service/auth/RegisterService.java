package io.github.piponsio.smartfinances_api.service.auth;

import io.github.piponsio.smartfinances_api.dto.request.RegisterRequestDto;

public interface RegisterService {
    void registerUser(RegisterRequestDto registerRequestDto);
}
