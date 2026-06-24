package com.devpulse.dto.response;

import com.devpulse.entity.Task;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data @Builder
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private Task.Status status;
    private Task.Priority priority;
    private UUID projectId;
    private String projectName;
    private UserResponse assignee;
    private UserResponse reporter;
    private LocalDate dueDate;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private Integer position;
    private boolean archived;
    private Set<String> tags;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
