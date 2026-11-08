package io.github.piponsio.smartfinances_api.service.category;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.piponsio.smartfinances_api.dto.request.CategoryRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.CategoryResponseDto;
import io.github.piponsio.smartfinances_api.entity.Category;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import io.github.piponsio.smartfinances_api.exception.ResourceNotFoundException;
import io.github.piponsio.smartfinances_api.repository.CategoryRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final AuthUser authUser;
    private final CategoryRepository categoryRepository;

    @Override
    public void setDefaultCategory(User user) {
        List<String> incomeNames = List.of("Salary", "Freelance", "Investments", "Other Income");
        List<String> expenseNames = List.of("Food & Dining", "Transportation", "Utilities", "Housing",
                "Healthcare", "Shopping", "Education", "Subscriptions",
                "Personal Care", "Other Expenses");

        List<Category> defaultCategories = createDefaultCategories(incomeNames, expenseNames);
        user.addCategories(defaultCategories);
    }

    @Override
    @Transactional
    public String createCustomCategory(CategoryRequestDto categoryRequestDto) {
        User user = authUser.getAuthenticatedUser();

        categoryRepository.findByNameAndUser(categoryRequestDto.getCategoryName(), user)
                .ifPresent(c -> {
                    throw new IllegalStateException("Category already exists");
                });

        Category category = createCategory(categoryRequestDto.getCategoryName(), categoryRequestDto.getType());
        user.addCategory(category);
        return category.getName();
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        User user = authUser.getAuthenticatedUser();
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (!category.getTransactions().isEmpty()) {
            throw new IllegalStateException("Cannot delete a category that has existing transactions");
        }
        categoryRepository.delete(category);
    }

    @Override
    public List<CategoryResponseDto> getAllUserCategories() {
        User user = authUser.getAuthenticatedUser();

        return user.getCategories()
                .stream()
                .map(category -> {
                    CategoryResponseDto categoryResponseDto = new CategoryResponseDto();
                    categoryResponseDto.setId(category.getId());
                    categoryResponseDto.setName(category.getName());
                    categoryResponseDto.setType(category.getType());
                    return categoryResponseDto;
                })
                .toList();
    }

    private List<Category> createDefaultCategories(List<String> incomeNames, List<String> expenseNames) {
        List<Category> categories = new ArrayList<>();

        incomeNames.forEach(name -> categories.add(createCategory(name, TransactionType.INCOME)));
        expenseNames.forEach(name -> categories.add(createCategory(name, TransactionType.EXPENSE)));

        return categories;
    }

    private Category createCategory(String name, TransactionType categoryType) {
        Category category = new Category();
        category.setName(name);
        category.setType(categoryType);
        return category;
    }
}
