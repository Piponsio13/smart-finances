package io.github.piponsio.smartfinances_api.service.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.piponsio.smartfinances_api.dto.request.SocialLoginRequest;
import io.github.piponsio.smartfinances_api.dto.response.LoginReponseDto;
import io.github.piponsio.smartfinances_api.entity.*;
import io.github.piponsio.smartfinances_api.enums.RoleType;
import io.github.piponsio.smartfinances_api.repository.*;
import io.github.piponsio.smartfinances_api.security.*;
import io.github.piponsio.smartfinances_api.service.category.CategoryServiceImpl;
import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class SocialLoginService {
    private final SocialTokenVerifier verifier;
    private final SocialIdentityRepository identities;
    private final UsedSocialTokenRepository usedTokens;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final CategoryServiceImpl categories;
    private final JwtUtils jwtUtils;

    @Transactional
    public LoginReponseDto login(String provider, SocialLoginRequest request) {
        var claims = verifier.verify(provider, request.idToken(), request.nonce());
        String digest = digest(request.idToken());
        if (usedTokens.existsById(digest)) throw new BadCredentialsException("Provider token already used");
        // Unique primary key also prevents concurrent replays across API instances.
        usedTokens.deleteByExpiresAtBefore(Instant.now().minusSeconds(120));
        if (usedTokens.consume(digest, claims.getExpiresAt()) != 1) {
            throw new BadCredentialsException("Provider token already used");
        }
        User user = identities.findByProviderAndSubject(provider, claims.getSubject())
                .map(SocialIdentity::getUser).orElse(null);
        if (user == null) {
            String email = claims.getClaimAsString("email");
            if (email == null || !"true".equals(String.valueOf(claims.getClaims().get("email_verified")))) {
                throw new BadCredentialsException("A verified provider email is required");
            }
            email = email.trim().toLowerCase(Locale.ROOT);
            if (users.existsByEmailIgnoreCase(email)) {
                throw new IllegalStateException("An account with this email already exists. Sign in with your existing method.");
            }
            user = new User();
            user.setEmail(email);
            String name = claims.getClaimAsString("name");
            if (name == null || name.isBlank()) name = request.name();
            user.setName(name == null || name.isBlank() ? "Smart Finances user" : name.substring(0, Math.min(name.length(), 100)));
            // Social-only accounts have an unguessable password; no password is sent to clients.
            user.setPassword(encoder.encode(UUID.randomUUID().toString()));
            user.addRole(RoleType.OWNER);
            categories.setDefaultCategory(user);
            user = users.save(user);
            SocialIdentity identity = new SocialIdentity();
            identity.setProvider(provider);
            identity.setSubject(claims.getSubject());
            identity.setUser(user);
            identities.saveAndFlush(identity);
        }
        LoginReponseDto response = new LoginReponseDto();
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setToken(jwtUtils.generateToken(user));
        return response;
    }

    private String digest(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
