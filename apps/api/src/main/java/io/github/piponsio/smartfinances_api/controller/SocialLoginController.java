package io.github.piponsio.smartfinances_api.controller;

import org.springframework.web.bind.annotation.*;
import io.github.piponsio.smartfinances_api.dto.request.SocialLoginRequest;
import io.github.piponsio.smartfinances_api.dto.response.LoginReponseDto;
import io.github.piponsio.smartfinances_api.service.auth.SocialLoginService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class SocialLoginController {
    private final SocialLoginService service;
    @PostMapping("/social/{provider:google|apple}")
    public CustomResponse<LoginReponseDto> login(@PathVariable String provider, @Valid @RequestBody SocialLoginRequest request) {
        return CustomResponse.<LoginReponseDto>builder().data(service.login(provider, request))
                .message("Successful Login").statusCode(200).build();
    }
}
