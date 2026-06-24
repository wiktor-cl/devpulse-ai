package com.devpulse.service;

import com.devpulse.dto.request.TaskRequest;
import com.devpulse.dto.response.TaskResponse;
import com.devpulse.entity.Project;
import com.devpulse.entity.Task;
import com.devpulse.entity.User;
import com.devpulse.exception.ResourceNotFoundException;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import com.devpulse.repository.UserRepository;
import com.devpulse.service.impl.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User reporter;
    private Project project;

    @BeforeEach
    void setUp() {
        reporter = User.builder()
                .id(UUID.randomUUID()).email("r@d.ai").username("reporter")
                .fullName("Reporter").role(User.Role.USER).build();

        project = Project.builder()
                .id(UUID.randomUUID()).name("My Project")
                .owner(reporter).status(Project.Status.ACTIVE)
                .priority(Project.Priority.MEDIUM).progress(0)
                .color("#6366f1").members(new HashSet<>(Set.of(reporter)))
                .tasks(new ArrayList<>()).build();
    }

    @Test
    @DisplayName("Should create task with TODO status by default")
    void create_defaultStatusTodo() {
        TaskRequest req = new TaskRequest();
        req.setTitle("Fix the bug");
        req.setProjectId(project.getId());

        Task saved = Task.builder()
                .id(UUID.randomUUID()).title("Fix the bug")
                .status(Task.Status.TODO).priority(Task.Priority.MEDIUM)
                .project(project).reporter(reporter)
                .position(0).archived(false)
                .tags(new HashSet<>()).comments(new ArrayList<>()).build();

        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(taskRepository.countByProjectId(any())).thenReturn(0L);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        TaskResponse response = taskService.create(req, reporter);

        assertThat(response.getStatus()).isEqualTo(Task.Status.TODO);
        assertThat(response.getTitle()).isEqualTo("Fix the bug");
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("Should throw when project not found")
    void create_unknownProject_throwsException() {
        TaskRequest req = new TaskRequest();
        req.setTitle("Task");
        req.setProjectId(UUID.randomUUID());

        when(projectRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.create(req, reporter))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
