package io.github.piponsio.smartfinances_api.dto.request;
import jakarta.validation.constraints.*;
public record SocialLoginRequest(
    @NotBlank @Size(max = 16000) String idToken,
    @Size(max = 256) String nonce,
    @Size(max = 100) String name) {}
