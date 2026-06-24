package com.devpulse.dto.response;

import com.devpulse.entity.Project;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private Project.Status status;
    private Project.Priority priority;
    private UserResponse owner;
    private LocalDate deadline;
    private Integer progress;
    private String color;
    private String repositoryUrl;
    private long taskCount;
    private long completedTaskCount;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
