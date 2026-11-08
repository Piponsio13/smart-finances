package io.github.piponsio.smartfinances_api.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionSummaryRequestDto {
    private Integer month;
    private Integer year;
}
