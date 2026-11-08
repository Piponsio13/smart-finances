package io.github.piponsio.smartfinances_api.service.category;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.request.CategoryRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.CategoryResponseDto;
import io.github.piponsio.smartfinances_api.entity.User;

public interface CategoryService {
    void setDefaultCategory(User user);

    String createCustomCategory(CategoryRequestDto categoryRequestDto);

    void deleteCategory(Long id);

    List<CategoryResponseDto> getAllUserCategories();
}
