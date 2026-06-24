package com.devpulse.dto.request;

import com.devpulse.entity.Task;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
public class TaskRequest {

    @NotBlank @Size(max = 500)
    private String title;

    private String description;

    private Task.Status status;

    private Task.Priority priority;

    @NotNull
    private UUID projectId;

    private UUID assigneeId;

    private LocalDate dueDate;

    @DecimalMin("0.0") @DecimalMax("999.99")
    private BigDecimal estimatedHours;

    @DecimalMin("0.0") @DecimalMax("999.99")
    private BigDecimal actualHours;

    private Set<String> tags;

    private Integer position;
}
