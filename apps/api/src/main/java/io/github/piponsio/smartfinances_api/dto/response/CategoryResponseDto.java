package io.github.piponsio.smartfinances_api.dto.response;

import io.github.piponsio.smartfinances_api.enums.TransactionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponseDto {
    Long id;
    String name;
    TransactionType type;
}
