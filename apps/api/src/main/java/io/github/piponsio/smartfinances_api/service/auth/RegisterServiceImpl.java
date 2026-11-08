package io.github.piponsio.smartfinances_api.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.github.piponsio.smartfinances_api.dto.request.RegisterRequestDto;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.RoleType;
import io.github.piponsio.smartfinances_api.repository.UserRepository;
import io.github.piponsio.smartfinances_api.service.category.CategoryServiceImpl;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterServiceImpl implements RegisterService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryServiceImpl categoryService;

    @Override
    public void registerUser(RegisterRequestDto registerRequestDto) {
        if (userRepository.existsByEmail(registerRequestDto.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        User user = new User();
        user.setName(registerRequestDto.getName());
        user.setEmail(registerRequestDto.getEmail());
        user.addRole(RoleType.OWNER);

        String hashPassword = passwordEncoder.encode(registerRequestDto.getPassword());
        user.setPassword(hashPassword);

        categoryService.setDefaultCategory(user);
        userRepository.save(user);
    }
}
