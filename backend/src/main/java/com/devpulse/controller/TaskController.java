package com.devpulse.controller;

import com.devpulse.dto.request.TaskRequest;
import com.devpulse.dto.response.TaskResponse;
import com.devpulse.entity.Task;
import com.devpulse.entity.User;
import com.devpulse.service.impl.TaskService;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management and Kanban operations")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all tasks for a project (Kanban view)")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(@PathVariable UUID projectId,
                                                               @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, user));
    }

    @GetMapping("/project/{projectId}/paged")
    @Operation(summary = "Get paginated tasks for a project")
    public ResponseEntity<Page<TaskResponse>> getProjectTasksPaged(
            @PathVariable UUID projectId,
            @RequestParam(required = false) Task.Status status,
            @RequestParam(required = false) Task.Priority priority,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getProjectTasksPaged(projectId, status, priority, search, user, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskResponse> getTask(@PathVariable UUID id,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getById(id, user));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(request, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable UUID id,
                                                    @Valid @RequestBody TaskRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.update(id, request, user));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move task (change status / position for Kanban)")
    public ResponseEntity<TaskResponse> moveTask(@PathVariable UUID id,
                                                  @RequestBody Map<String, Object> body,
                                                  @AuthenticationPrincipal User user) {
        Task.Status newStatus = body.containsKey("status")
                ? Task.Status.valueOf((String) body.get("status")) : null;
        Integer newPosition = body.containsKey("position") ? (Integer) body.get("position") : null;
        return ResponseEntity.ok(taskService.moveTask(id, newStatus, newPosition, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id,
                                            @AuthenticationPrincipal User user) {
        taskService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
