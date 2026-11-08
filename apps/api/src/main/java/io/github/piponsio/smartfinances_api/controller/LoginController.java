package io.github.piponsio.smartfinances_api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.piponsio.smartfinances_api.dto.request.LoginRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.LoginReponseDto;
import io.github.piponsio.smartfinances_api.service.auth.LoginService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class LoginController {
    private final LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<CustomResponse<LoginReponseDto>> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        LoginReponseDto response = loginService.login(loginRequestDto);

        CustomResponse<LoginReponseDto> customResponse = CustomResponse.<LoginReponseDto>builder()
            .data(response)
            .message("Successful Login")
            .statusCode(HttpStatus.OK.value())
            .build();
        return ResponseEntity.status(HttpStatus.OK.value()).body(customResponse);
    }
}
