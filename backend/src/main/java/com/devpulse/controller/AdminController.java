package com.devpulse.controller;

import com.devpulse.dto.response.UserResponse;
import com.devpulse.entity.ActivityLog;
import com.devpulse.entity.User;
import com.devpulse.exception.ResourceNotFoundException;
import com.devpulse.repository.ActivityLogRepository;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import com.devpulse.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin panel — user management and system stats")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;

    @GetMapping("/stats")
    @Operation(summary = "Get system-wide statistics")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalProjects", projectRepository.count(),
                "totalTasks", taskRepository.count(),
                "activeUsers", userRepository.findAll().stream().filter(User::isActive).count()
        ));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users (paginated)")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<User> users = (search != null && !search.isBlank())
                ? userRepository.searchUsers(search, pageable)
                : userRepository.findAll(pageable);

        return ResponseEntity.ok(users.map(u -> UserResponse.builder()
                .id(u.getId()).email(u.getEmail()).username(u.getUsername())
                .fullName(u.getFullName()).role(u.getRole())
                .active(u.isActive()).lastLogin(u.getLastLogin())
                .createdAt(u.getCreatedAt()).build()));
    }

    @PatchMapping("/users/{id}/toggle-active")
    @Operation(summary = "Activate or deactivate a user")
    public ResponseEntity<Map<String, Object>> toggleUserActive(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("userId", id, "active", user.isActive()));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Change user role")
    public ResponseEntity<Map<String, Object>> changeRole(@PathVariable UUID id,
                                                           @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        User.Role newRole = User.Role.valueOf(body.get("role"));
        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("userId", id, "role", newRole));
    }

    @GetMapping("/activity-logs")
    @Operation(summary = "Get system activity logs")
    public ResponseEntity<Page<ActivityLog>> getActivityLogs(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(activityLogRepository.findAllByOrderByCreatedAtDesc(pageable));
    }
}
