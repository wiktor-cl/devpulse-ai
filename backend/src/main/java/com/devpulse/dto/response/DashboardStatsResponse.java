package com.devpulse.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder
public class DashboardStatsResponse {
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long totalTasks;
    private long activeTasks;
    private long completedTasks;
    private long unreadNotifications;
    private double productivityScore;
    private List<ActivityDataPoint> activityData;
    private List<TaskResponse> recentTasks;
    private List<ProjectResponse> recentProjects;

    @Data @Builder
    public static class ActivityDataPoint {
        private String date;
        private long tasksCompleted;
        private long tasksCreated;
    }
}
