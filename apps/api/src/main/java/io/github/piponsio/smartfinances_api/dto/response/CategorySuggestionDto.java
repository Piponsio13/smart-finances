package io.github.piponsio.smartfinances_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategorySuggestionDto {
    private Long categoryId;
    private String categoryName;
    // 0.0 - 1.0. Higher means we are more sure. null categoryId means no suggestion.
    private double confidence;
}
