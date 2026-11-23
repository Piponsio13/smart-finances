package io.github.piponsio.smartfinances_api.security;

import static org.junit.jupiter.api.Assertions.*;
import java.security.*;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.util.ReflectionTestUtils;
import io.jsonwebtoken.Jwts;

class SocialTokenVerifierTest {
    KeyPair keys;
    SocialTokenVerifier verifier;
    @BeforeEach
    void setup() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        keys = generator.generateKeyPair();
        verifier = new SocialTokenVerifier("", "");
        var decoder = NimbusJwtDecoder.withPublicKey((RSAPublicKey) keys.getPublic()).build();
        decoder.setJwtValidator(SocialTokenVerifier.validator(Set.of("our-client"), Set.of("https://accounts.google.com", "https://appleid.apple.com")));
        ReflectionTestUtils.setField(verifier, "decoders", Map.of("google", decoder, "apple", decoder));
    }
    String token(String issuer, String audience, Instant expires, String subject, PrivateKey key) {
        var builder = Jwts.builder().issuer(issuer).audience().add(audience).and()
                .subject(subject).claim("nonce", "expected").claim("email", "alice@example.com").claim("email_verified", true);
        if (expires != null) builder.expiration(Date.from(expires));
        return builder.signWith(key, Jwts.SIG.RS256).compact();
    }
    @Test void acceptsSignedProviderTokens() {
        for (String provider : List.of("google", "apple")) {
            String issuer = provider.equals("google") ? "https://accounts.google.com" : "https://appleid.apple.com";
            assertEquals("stable-subject", verifier.verify(provider, token(issuer, "our-client", Instant.now().plusSeconds(300), "stable-subject", keys.getPrivate()), "expected").getSubject());
        }
    }
    @Test void rejectsInvalidIssuerAudienceExpirySubjectAndSignature() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA"); generator.initialize(2048);
        for (String bad : List.of(
                token("https://attacker.example", "our-client", Instant.now().plusSeconds(300), "subject", keys.getPrivate()),
                token("https://accounts.google.com", "other-client", Instant.now().plusSeconds(300), "subject", keys.getPrivate()),
                token("https://accounts.google.com", "our-client", Instant.now().minusSeconds(300), "subject", keys.getPrivate()),
                token("https://accounts.google.com", "our-client", null, "subject", keys.getPrivate()),
                token("https://accounts.google.com", "our-client", Instant.now().plusSeconds(300), "", keys.getPrivate()),
                token("https://accounts.google.com", "our-client", Instant.now().plusSeconds(300), "subject", generator.generateKeyPair().getPrivate()),
                "malformed")) {
            assertThrows(BadCredentialsException.class, () -> verifier.verify("google", bad, "expected"));
        }
    }
    @Test void rejectsMissingIssuerAndAudience() {
        var validation = SocialTokenVerifier.validator(Set.of("our-client"), Set.of("https://accounts.google.com"));
        var noIssuer = Jwt.withTokenValue("test").header("alg", "RS256").subject("user")
                .audience(List.of("our-client")).expiresAt(Instant.now().plusSeconds(300)).build();
        var noAudience = Jwt.withTokenValue("test").header("alg", "RS256").subject("user")
                .issuer("https://accounts.google.com").expiresAt(Instant.now().plusSeconds(300)).build();
        assertTrue(validation.validate(noIssuer).hasErrors());
        assertTrue(validation.validate(noAudience).hasErrors());
    }
    @Test void rejectsMissingAndMismatchedNonceAndUnconfiguredProvider() {
        String signed = token("https://accounts.google.com", "our-client", Instant.now().plusSeconds(300), "subject", keys.getPrivate());
        assertThrows(BadCredentialsException.class, () -> verifier.verify("google", signed, "wrong"));
        assertThrows(BadCredentialsException.class, () -> verifier.verify("google", signed, null));
        assertThrows(IllegalStateException.class, () -> new SocialTokenVerifier("", "").verify("apple", signed, "expected"));
    }
}
