package com.devpulse.dto.request;

import com.devpulse.entity.Project;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {

    @NotBlank @Size(max = 255)
    private String name;

    private String description;

    private Project.Status status;

    private Project.Priority priority;

    private LocalDate deadline;

    @Min(0) @Max(100)
    private Integer progress;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
    private String color;

    private String repositoryUrl;
}
