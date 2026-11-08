package io.github.piponsio.smartfinances_api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.piponsio.smartfinances_api.dto.request.CategoryRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.CategoryResponseDto;
import io.github.piponsio.smartfinances_api.service.category.CategoryService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    ResponseEntity<CustomResponse<String>> createCustomCategory(@Valid @RequestBody CategoryRequestDto categoryRequestDto) {
        String categoryName = categoryService.createCustomCategory(categoryRequestDto);
        CustomResponse<String> customResponse = CustomResponse.<String>builder()
                .data(categoryName)
                .message("Category created successfully")
                .statusCode(HttpStatus.CREATED.value())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(customResponse);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<CustomResponse<Void>> deleteCustomCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        CustomResponse<Void> customResponse = CustomResponse.<Void>builder()
                .data(null)
                .message("Category deleted successfully")
                .statusCode(HttpStatus.OK.value())
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(customResponse);
    }

    @GetMapping("/all")
    public ResponseEntity<CustomResponse<List<CategoryResponseDto>>> getAllUserCategories() {
        List<CategoryResponseDto> response = categoryService.getAllUserCategories();

        HttpStatus status = response.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;
        String message = response.isEmpty() ? "User does not have categories" : "All user categories retrieved successfully";

        CustomResponse<List<CategoryResponseDto>> customResponse = CustomResponse.<List<CategoryResponseDto>>builder()
                .data(response)
                .message(message)
                .statusCode(status.value())
                .build();

        return ResponseEntity.status(status).body(customResponse);
    }
}
