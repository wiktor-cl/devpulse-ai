package com.devpulse.service.impl;

import com.devpulse.dto.request.ProjectRequest;
import com.devpulse.dto.response.ProjectResponse;
import com.devpulse.dto.response.UserResponse;
import com.devpulse.entity.Project;
import com.devpulse.entity.User;
import com.devpulse.exception.BusinessException;
import com.devpulse.exception.ResourceNotFoundException;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import com.devpulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getUserProjects(User user, Project.Status status,
            Project.Priority priority, String search, Pageable pageable) {
        return projectRepository.findFiltered(user, status, priority, search, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "projects", key = "#id")
    public ProjectResponse getById(UUID id, User user) {
        Project project = findAndValidateAccess(id, user);
        return toResponse(project);
    }

    public ProjectResponse create(ProjectRequest request, User owner) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Project.Status.ACTIVE)
                .priority(request.getPriority() != null ? request.getPriority() : Project.Priority.MEDIUM)
                .owner(owner)
                .deadline(request.getDeadline())
                .progress(request.getProgress() != null ? request.getProgress() : 0)
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .repositoryUrl(request.getRepositoryUrl())
                .build();

        project.getMembers().add(owner);
        Project saved = projectRepository.save(project);
        log.info("Project created: {} by user {}", saved.getId(), owner.getId());
        return toResponse(saved);
    }

    @CacheEvict(value = "projects", key = "#id")
    public ProjectResponse update(UUID id, ProjectRequest request, User user) {
        Project project = findAndValidateOwnerOrAdmin(id, user);

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getDeadline() != null) project.setDeadline(request.getDeadline());
        if (request.getProgress() != null) project.setProgress(request.getProgress());
        if (request.getColor() != null) project.setColor(request.getColor());
        if (request.getRepositoryUrl() != null) project.setRepositoryUrl(request.getRepositoryUrl());

        return toResponse(projectRepository.save(project));
    }

    @CacheEvict(value = "projects", key = "#id")
    public void delete(UUID id, User user) {
        Project project = findAndValidateOwnerOrAdmin(id, user);
        projectRepository.delete(project);
        log.info("Project deleted: {} by user {}", id, user.getId());
    }

    public void addMember(UUID projectId, UUID userId, User requester) {
        Project project = findAndValidateOwnerOrAdmin(projectId, requester);
        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (project.getMembers().contains(newMember)) {
            throw new BusinessException("User is already a member of this project");
        }

        project.getMembers().add(newMember);
        projectRepository.save(project);
    }

    public void removeMember(UUID projectId, UUID userId, User requester) {
        Project project = findAndValidateOwnerOrAdmin(projectId, requester);
        if (project.getOwner().getId().equals(userId)) {
            throw new BusinessException("Cannot remove the project owner");
        }
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        project.getMembers().remove(member);
        projectRepository.save(project);
    }

    private Project findAndValidateAccess(UUID id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        if (!project.getOwner().getId().equals(user.getId()) &&
                !project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId())) &&
                user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("You don't have access to this project");
        }
        return project;
    }

    private Project findAndValidateOwnerOrAdmin(UUID id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
        if (!project.getOwner().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the project owner can perform this action");
        }
        return project;
    }

    public ProjectResponse toResponse(Project p) {
        long taskCount = taskRepository.countByProjectId(p.getId());
        long completedCount = taskRepository.countByProjectIdAndStatus(p.getId(), com.devpulse.entity.Task.Status.DONE);

        return ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .status(p.getStatus())
                .priority(p.getPriority())
                .owner(toUserResponse(p.getOwner()))
                .deadline(p.getDeadline())
                .progress(p.getProgress())
                .color(p.getColor())
                .repositoryUrl(p.getRepositoryUrl())
                .taskCount(taskCount)
                .completedTaskCount(completedCount)
                .memberCount(p.getMembers().size())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
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
