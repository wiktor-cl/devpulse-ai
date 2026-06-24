package com.devpulse.service.impl;

import com.devpulse.dto.response.DashboardStatsResponse;
import com.devpulse.dto.response.ProjectResponse;
import com.devpulse.dto.response.TaskResponse;
import com.devpulse.entity.Project;
import com.devpulse.entity.Task;
import com.devpulse.entity.User;
import com.devpulse.repository.NotificationRepository;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final ProjectService projectService;
    private final TaskService taskService;

    @Cacheable(value = "dashboard", key = "#user.id")
    public DashboardStatsResponse getDashboardStats(User user) {
        List<Project> allProjects = projectRepository.findAllByMemberOrOwner(user);

        long totalProjects = allProjects.size();
        long activeProjects = allProjects.stream().filter(p -> p.getStatus() == Project.Status.ACTIVE).count();
        long completedProjects = allProjects.stream().filter(p -> p.getStatus() == Project.Status.COMPLETED).count();

        long totalTasks = taskRepository.countActiveTasksByUser(user) + taskRepository.countCompletedTasksByUser(user);
        long activeTasks = taskRepository.countActiveTasksByUser(user);
        long completedTasks = taskRepository.countCompletedTasksByUser(user);

        long unread = notificationRepository.countByUserIdAndReadFalse(user.getId());

        double productivityScore = totalTasks > 0
                ? Math.round((completedTasks * 100.0 / totalTasks) * 10.0) / 10.0
                : 0.0;

        // Last 7 days activity data (simulated; real impl queries activity_logs)
        List<DashboardStatsResponse.ActivityDataPoint> activityData = generateActivityData();

        // Recent tasks assigned to user
        List<TaskResponse> recentTasks = taskRepository.findByAssignee(user)
                .stream().limit(5).map(taskService::toResponse).toList();

        // Recent projects
        List<ProjectResponse> recentProjects = projectRepository
                .findByMemberOrOwner(user, PageRequest.of(0, 5))
                .stream().map(projectService::toResponse).toList();

        return DashboardStatsResponse.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .totalTasks(totalTasks)
                .activeTasks(activeTasks)
                .completedTasks(completedTasks)
                .unreadNotifications(unread)
                .productivityScore(productivityScore)
                .activityData(activityData)
                .recentTasks(recentTasks)
                .recentProjects(recentProjects)
                .build();
    }

    private List<DashboardStatsResponse.ActivityDataPoint> generateActivityData() {
        List<DashboardStatsResponse.ActivityDataPoint> data = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            data.add(DashboardStatsResponse.ActivityDataPoint.builder()
                    .date(date.format(fmt))
                    .tasksCompleted((long) (Math.random() * 8))
                    .tasksCreated((long) (Math.random() * 5))
                    .build());
        }
        return data;
    }
}
