package com.devpulse.controller;

import com.devpulse.dto.request.ProjectRequest;
import com.devpulse.dto.response.ProjectResponse;
import com.devpulse.entity.Project;
import com.devpulse.entity.User;
import com.devpulse.service.impl.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management CRUD")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all projects for current user")
    public ResponseEntity<Page<ProjectResponse>> getProjects(
            @RequestParam(required = false) Project.Status status,
            @RequestParam(required = false) Project.Priority priority,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.getUserProjects(user, status, priority, search, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable UUID id,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.getById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create new project")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request,
                                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable UUID id,
                                                          @Valid @RequestBody ProjectRequest request,
                                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id,
                                               @AuthenticationPrincipal User user) {
        projectService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}")
    @Operation(summary = "Add member to project")
    public ResponseEntity<Void> addMember(@PathVariable UUID id,
                                           @PathVariable UUID userId,
                                           @AuthenticationPrincipal User user) {
        projectService.addMember(id, userId, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove member from project")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id,
                                              @PathVariable UUID userId,
                                              @AuthenticationPrincipal User user) {
        projectService.removeMember(id, userId, user);
        return ResponseEntity.noContent().build();
    }
}
