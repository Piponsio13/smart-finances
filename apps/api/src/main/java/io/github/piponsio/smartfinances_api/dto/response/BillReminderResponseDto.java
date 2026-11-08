package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BillReminderResponseDto {
    private Long id;
    private String name;
    private BigDecimal amount;
    private Integer dueDay;
    private String categoryName;
    private boolean active;
    private String status;
    private Long daysUntilDue;
}
