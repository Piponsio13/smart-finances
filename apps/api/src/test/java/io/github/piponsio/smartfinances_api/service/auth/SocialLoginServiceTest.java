package io.github.piponsio.smartfinances_api.service.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import io.github.piponsio.smartfinances_api.dto.request.SocialLoginRequest;
import io.github.piponsio.smartfinances_api.entity.*;
import io.github.piponsio.smartfinances_api.repository.*;
import io.github.piponsio.smartfinances_api.security.*;
import io.github.piponsio.smartfinances_api.service.category.CategoryServiceImpl;

class SocialLoginServiceTest {
    SocialTokenVerifier verifier = mock(SocialTokenVerifier.class);
    SocialIdentityRepository identities = mock(SocialIdentityRepository.class);
    UsedSocialTokenRepository tokens = mock(UsedSocialTokenRepository.class);
    UserRepository users = mock(UserRepository.class);
    CategoryServiceImpl categories = mock(CategoryServiceImpl.class);
    JwtUtils jwt = mock(JwtUtils.class);
    SocialLoginService service = new SocialLoginService(verifier, identities, tokens, users, new BCryptPasswordEncoder(), categories, jwt);
    SocialLoginRequest request = new SocialLoginRequest("signed-token", "nonce", "Alice");
    Jwt claims(boolean verified) {
        return Jwt.withTokenValue("signed-token").header("alg", "RS256").subject("stable-id")
                .expiresAt(Instant.now().plusSeconds(300)).claim("email", "Alice@example.com").claim("email_verified", verified).build();
    }
    @BeforeEach void setup() {
        when(verifier.verify("google", "signed-token", "nonce")).thenReturn(claims(true));
        when(tokens.consume(anyString(), any())).thenReturn(1);
        when(identities.findByProviderAndSubject("google", "stable-id")).thenReturn(Optional.empty());
        when(users.save(any())).thenAnswer(call -> call.getArgument(0));
        when(jwt.generateToken(any())).thenReturn("app-token");
    }
    @Test void newAccountGetsDefaultCategoriesRolesAndAppToken() {
        assertEquals("app-token", service.login("google", request).getToken());
        verify(users).save(argThat(user -> user.getEmail().equals("alice@example.com") && user.getRoles().size() == 1 && !user.getPassword().isBlank()));
        verify(categories).setDefaultCategory(any());
        verify(identities).saveAndFlush(argThat(identity -> identity.getSubject().equals("stable-id")));
    }
    @Test void returningAccountUsesSubjectEvenWhenEmailChanges() {
        User user = new User(); user.setEmail("original@example.com");
        SocialIdentity identity = new SocialIdentity(); identity.setUser(user);
        when(identities.findByProviderAndSubject("google", "stable-id")).thenReturn(Optional.of(identity));
        assertEquals("original@example.com", service.login("google", request).getEmail());
        verify(users, never()).save(any());
    }
    @Test void doesNotLinkExistingAccountByEmail() {
        when(users.existsByEmailIgnoreCase("alice@example.com")).thenReturn(true);
        assertThrows(IllegalStateException.class, () -> service.login("google", request));
        verify(users, never()).save(any());
    }
    @Test void rejectsUnverifiedEmailAndReplays() {
        when(verifier.verify("google", "signed-token", "nonce")).thenReturn(claims(false));
        assertThrows(BadCredentialsException.class, () -> service.login("google", request));
        when(tokens.consume(anyString(), any())).thenReturn(0);
        assertThrows(BadCredentialsException.class, () -> service.login("google", request));
        verify(users, never()).save(any());
    }
}
