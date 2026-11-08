package io.github.piponsio.smartfinances_api.dto.request;

import io.github.piponsio.smartfinances_api.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequestDto {
    @NotBlank(message = "Category name is required")
    String categoryName;

    @NotNull(message = "Type is required")
    TransactionType type;
}
