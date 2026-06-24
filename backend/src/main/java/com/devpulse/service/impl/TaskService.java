package com.devpulse.service.impl;

import com.devpulse.dto.request.TaskRequest;
import com.devpulse.dto.response.TaskResponse;
import com.devpulse.dto.response.UserResponse;
import com.devpulse.entity.Project;
import com.devpulse.entity.Task;
import com.devpulse.entity.User;
import com.devpulse.exception.BusinessException;
import com.devpulse.exception.ResourceNotFoundException;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import com.devpulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(UUID projectId, User user) {
        validateProjectAccess(projectId, user);
        return taskRepository.findByProjectIdOrderByPosition(projectId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getProjectTasksPaged(UUID projectId, Task.Status status,
            Task.Priority priority, String search, User user, Pageable pageable) {
        validateProjectAccess(projectId, user);
        return taskRepository.findFiltered(projectId, status, priority, search, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(UUID id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        validateProjectAccess(task.getProject().getId(), user);
        return toResponse(task);
    }

    public TaskResponse create(TaskRequest request, User reporter) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));

        validateProjectAccess(project.getId(), reporter);

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
        }

        long position = taskRepository.countByProjectId(project.getId());

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .project(project)
                .assignee(assignee)
                .reporter(reporter)
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours())
                .actualHours(request.getActualHours())
                .tags(request.getTags() != null ? request.getTags() : new java.util.HashSet<>())
                .position((int) position)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created: {} in project {}", saved.getId(), project.getId());
        return toResponse(saved);
    }

    public TaskResponse update(UUID id, TaskRequest request, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        validateProjectAccess(task.getProject().getId(), user);

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getActualHours() != null) task.setActualHours(request.getActualHours());
        if (request.getTags() != null) task.setTags(request.getTags());
        if (request.getPosition() != null) task.setPosition(request.getPosition());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        return toResponse(taskRepository.save(task));
    }

    public TaskResponse moveTask(UUID id, Task.Status newStatus, Integer newPosition, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        validateProjectAccess(task.getProject().getId(), user);

        if (newStatus != null) task.setStatus(newStatus);
        if (newPosition != null) task.setPosition(newPosition);

        return toResponse(taskRepository.save(task));
    }

    public void delete(UUID id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        if (!task.getReporter().getId().equals(user.getId()) &&
                !task.getProject().getOwner().getId().equals(user.getId()) &&
                user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("You cannot delete this task");
        }

        taskRepository.delete(task);
        log.info("Task deleted: {}", id);
    }

    private void validateProjectAccess(UUID projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        boolean hasAccess = project.getOwner().getId().equals(user.getId()) ||
                project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId())) ||
                user.getRole() == User.Role.ADMIN;

        if (!hasAccess) {
            throw new AccessDeniedException("You don't have access to this project");
        }
    }

    public TaskResponse toResponse(Task t) {
        return TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .projectId(t.getProject().getId())
                .projectName(t.getProject().getName())
                .assignee(t.getAssignee() != null ? toUserResponse(t.getAssignee()) : null)
                .reporter(toUserResponse(t.getReporter()))
                .dueDate(t.getDueDate())
                .estimatedHours(t.getEstimatedHours())
                .actualHours(t.getActualHours())
                .position(t.getPosition())
                .archived(t.isArchived())
                .tags(t.getTags())
                .commentCount(t.getComments().size())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole())
                .build();
    }
}
