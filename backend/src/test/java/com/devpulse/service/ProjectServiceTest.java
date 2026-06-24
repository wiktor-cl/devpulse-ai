package com.devpulse.service;

import com.devpulse.dto.request.ProjectRequest;
import com.devpulse.dto.response.ProjectResponse;
import com.devpulse.entity.Project;
import com.devpulse.entity.User;
import com.devpulse.exception.ResourceNotFoundException;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import com.devpulse.repository.UserRepository;
import com.devpulse.service.impl.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectService Unit Tests")
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ProjectService projectService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(UUID.randomUUID())
                .email("owner@devpulse.ai")
                .username("owner")
                .fullName("Project Owner")
                .role(User.Role.USER)
                .build();
    }

    @Test
    @DisplayName("Should create project and add owner as member")
    void create_addsOwnerAsMember() {
        ProjectRequest req = new ProjectRequest();
        req.setName("Test Project");
        req.setDescription("A test project");

        Project saved = Project.builder()
                .id(UUID.randomUUID())
                .name("Test Project")
                .description("A test project")
                .owner(owner)
                .status(Project.Status.ACTIVE)
                .priority(Project.Priority.MEDIUM)
                .progress(0)
                .color("#6366f1")
                .members(new HashSet<>())
                .build();
        saved.getMembers().add(owner);

        when(projectRepository.save(any(Project.class))).thenReturn(saved);
        when(taskRepository.countByProjectId(any())).thenReturn(0L);
        when(taskRepository.countByProjectIdAndStatus(any(), any())).thenReturn(0L);

        ProjectResponse response = projectService.create(req, owner);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Test Project");
        assertThat(response.getMemberCount()).isEqualTo(1);
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException for unknown project ID")
    void getById_unknownId_throwsException() {
        UUID unknownId = UUID.randomUUID();
        when(projectRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getById(unknownId, owner))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Project");
    }
}
