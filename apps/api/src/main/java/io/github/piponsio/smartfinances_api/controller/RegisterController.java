package io.github.piponsio.smartfinances_api.controller;

import org.springframework.web.bind.annotation.RestController;

import io.github.piponsio.smartfinances_api.dto.request.RegisterRequestDto;
import io.github.piponsio.smartfinances_api.service.auth.RegisterService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RegisterController {
    private final RegisterService registerService;

    @PostMapping("/register")
    public ResponseEntity<CustomResponse<Void>> registerUser(@Valid @RequestBody RegisterRequestDto registerRequestDto){
        registerService.registerUser(registerRequestDto);
        CustomResponse<Void>response = CustomResponse.<Void>builder()
            .data(null)
            .message("User created succesfully!")
            .statusCode(HttpStatus.CREATED.value())
            .build();
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(response);
    }
}
