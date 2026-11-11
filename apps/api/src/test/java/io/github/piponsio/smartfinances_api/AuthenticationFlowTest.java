package io.github.piponsio.smartfinances_api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import com.jayway.jsonpath.JsonPath;
import io.github.piponsio.smartfinances_api.controller.LoginController;
import io.github.piponsio.smartfinances_api.controller.RegisterController;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.RoleType;
import io.github.piponsio.smartfinances_api.exception.GlobalExceptionHandler;
import io.github.piponsio.smartfinances_api.repository.UserRepository;
import io.github.piponsio.smartfinances_api.security.*;
import io.github.piponsio.smartfinances_api.service.CustomUserDetailsService;
import io.github.piponsio.smartfinances_api.service.auth.LoginServiceImpl;
import io.github.piponsio.smartfinances_api.service.auth.RegisterServiceImpl;
import io.github.piponsio.smartfinances_api.service.category.CategoryServiceImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.Filter;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = AuthenticationFlowTest.Config.class)
@TestPropertySource(properties = {
    "jwt.secret=" + AuthenticationFlowTest.SECRET,
    "jwt.expiration=3600000",
    "app.cors.allowed-origins=http://localhost:5173,https://finance.example"
})
class AuthenticationFlowTest {
    static final String SECRET = "authentication-tests-only-secret-0123456789";
    static final String EMAIL = "alice@example.com";
    static final String PASSWORD = "correct-password";

    @Configuration
    @EnableWebMvc
    @Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtUtils.class,
        CustomUserDetailsService.class, LoginController.class, RegisterController.class,
        LoginServiceImpl.class, RegisterServiceImpl.class, GlobalExceptionHandler.class,
        ForbiddenController.class})
    static class Config {
        @Bean UserRepository userRepository() { return mock(UserRepository.class); }
        @Bean CategoryServiceImpl categoryService() { return mock(CategoryServiceImpl.class); }
    }

    @RestController
    static class ForbiddenController {
        @GetMapping("/api/forbidden")
        @PreAuthorize("denyAll()")
        public String forbidden() { return "unreachable"; }
    }

    @Autowired WebApplicationContext context;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwt;
    MockMvc mvc;
    User user;

    @BeforeEach
    void setUp() {
        reset(users);
        user = new User();
        user.setId(1L);
        user.setName("Alice");
        user.setEmail(EMAIL);
        user.setPassword(encoder.encode(PASSWORD));
        user.addRole(RoleType.OWNER);
        when(users.findByEmailWithRoles(EMAIL)).thenReturn(Optional.of(user));
        when(users.existsByEmail(EMAIL)).thenReturn(true);
        when(users.save(any(User.class))).thenAnswer(call -> call.getArgument(0));
        mvc = MockMvcBuilders.webAppContextSetup(context)
            .addFilters(context.getBean("springSecurityFilterChain", Filter.class)).build();
    }

    @Test
    void loginTokenAuthenticatesCurrentUserWithoutExposingPasswordOrRoles() throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.email").value(EMAIL))
            .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(body, "$.data.token");
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.name").value("Alice"))
            .andExpect(jsonPath("$.data.email").value(EMAIL))
            .andExpect(jsonPath("$.data.password").doesNotExist())
            .andExpect(jsonPath("$.data.roles").doesNotExist());
    }

    @Test
    void badCredentialsAndUnknownAccountsReturnTheSame401() throws Exception {
        for (String email : new String[]{EMAIL, "unknown@example.com"}) {
            when(users.findByEmailWithRoles("unknown@example.com")).thenReturn(Optional.empty());
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }
    }

    @Test
    void missingTokenReturnsJson401InsteadOf403() throws Exception {
        mvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", "Bearer"))
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.statusCode").value(401));
    }

    @Test
    void malformedExpiredForgedAndNonExpiringTokensAreRejected() throws Exception {
        String expired = Jwts.builder().subject(EMAIL).expiration(new Date(0))
            .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();
        String noExpiry = Jwts.builder().subject(EMAIL)
            .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8))).compact();
        String forged = Jwts.builder().subject(EMAIL).expiration(new Date(System.currentTimeMillis() + 60000))
            .signWith(Keys.hmacShaKeyFor("different-test-secret-01234567890123456789".getBytes(StandardCharsets.UTF_8))).compact();
        for (String token : new String[]{"invalid", expired, forged, noExpiry}) {
            mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.statusCode").value(401));
        }
    }

    @Test
    void deletedAccountCannotReuseItsToken() throws Exception {
        String token = jwt.generateToken(user);
        when(users.findByEmailWithRoles(EMAIL)).thenReturn(Optional.empty());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void permissionFailuresRemain403() throws Exception {
        mvc.perform(get("/api/forbidden").header("Authorization", "Bearer " + jwt.generateToken(user)))
            .andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value("Access denied"));
    }

    @Test
    void registrationHashesPasswordAndRejectsDuplicateAndInvalidInput() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bob\",\"email\":\"bob@example.com\",\"password\":\"new-password\"}"))
            .andExpect(status().isCreated());
        verify(users).save(argThat(saved -> saved.getEmail().equals("bob@example.com")
            && encoder.matches("new-password", saved.getPassword())));
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Alice\",\"email\":\"" + EMAIL + "\",\"password\":\"new-password\"}"))
            .andExpect(status().isConflict());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bob\",\"email\":\"bob@example.com\",\"password\":\"short\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.data.password").exists());
    }

    @Test
    void configuredOriginsCanPreflightProtectedEndpoints() throws Exception {
        mvc.perform(options("/api/auth/me").header("Origin", "https://finance.example")
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "authorization"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "https://finance.example"));
        mvc.perform(options("/api/auth/me").header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isForbidden());
    }
}
