package io.github.piponsio.smartfinances_api.security;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

@Component
public class SocialTokenVerifier {
    private final Map<String, JwtDecoder> decoders = new HashMap<>();

    public SocialTokenVerifier(@Value("${app.auth.google.client-ids:}") String googleIds,
                               @Value("${app.auth.apple.client-ids:}") String appleIds) {
        configure("google", googleIds, "https://www.googleapis.com/oauth2/v3/certs",
                Set.of("https://accounts.google.com", "accounts.google.com"));
        configure("apple", appleIds, "https://appleid.apple.com/auth/keys", Set.of("https://appleid.apple.com"));
    }

    private void configure(String provider, String ids, String keys, Set<String> issuers) {
        Set<String> audiences = new HashSet<>();
        Arrays.stream(ids.split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(audiences::add);
        if (audiences.isEmpty()) return;
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(keys).build();
        decoder.setJwtValidator(validator(audiences, issuers));
        decoders.put(provider, decoder);
    }

    static OAuth2TokenValidator<Jwt> validator(Set<String> audiences, Set<String> issuers) {
        OAuth2TokenValidator<Jwt> claims = jwt -> {
            String issuer = jwt.getClaimAsString("iss");
            if (issuer != null && issuers.contains(issuer)
                    && jwt.getAudience() != null && jwt.getAudience().stream().anyMatch(audiences::contains)
                    && jwt.getExpiresAt() != null && jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
        };
        return new DelegatingOAuth2TokenValidator<>(new JwtTimestampValidator(), claims);
    }

    public Jwt verify(String provider, String token, String nonce) {
        JwtDecoder decoder = decoders.get(provider);
        if (decoder == null) throw new IllegalStateException("This sign-in provider is not configured");
        try {
            Jwt jwt = decoder.decode(token);
            String actualNonce = jwt.getClaimAsString("nonce");
            if ((nonce != null || actualNonce != null) && !Objects.equals(nonce, actualNonce)) {
                throw new BadCredentialsException("Invalid provider nonce");
            }
            return jwt;
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid provider token", ex);
        }
    }
}
