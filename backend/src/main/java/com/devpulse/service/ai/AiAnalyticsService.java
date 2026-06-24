package com.devpulse.service.ai;

import com.devpulse.dto.response.TaskResponse;
import com.devpulse.entity.AiReport;
import com.devpulse.entity.Project;
import com.devpulse.entity.Task;
import com.devpulse.entity.User;
import com.devpulse.exception.ResourceNotFoundException;
import com.devpulse.repository.AiReportRepository;
import com.devpulse.repository.ProjectRepository;
import com.devpulse.repository.TaskRepository;
import com.devpulse.service.impl.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AiAnalyticsService {

    private final AiReportRepository aiReportRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskService taskService;

    @Value("${app.openai.api-key}")
    private String openAiKey;

    @Value("${app.openai.model}")
    private String model;

    @Value("${app.openai.max-tokens}")
    private int maxTokens;

    @Transactional(readOnly = true)
    public Page<AiReport> getUserReports(UUID userId, Pageable pageable) {
        return aiReportRepository.findByUserIdOrderByGeneratedAtDesc(userId, pageable);
    }

    public AiReport generateWeeklyReport(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);

        List<Task> userTasks = taskRepository.findByAssignee(user);
        List<Task> completedThisWeek = userTasks.stream()
                .filter(t -> t.getStatus() == Task.Status.DONE)
                .collect(Collectors.toList());

        long overdue = userTasks.stream()
                .filter(t -> t.getDueDate() != null &&
                        t.getDueDate().isBefore(LocalDate.now()) &&
                        t.getStatus() != Task.Status.DONE &&
                        t.getStatus() != Task.Status.CANCELLED)
                .count();

        String prompt = buildWeeklyReportPrompt(user, userTasks, completedThisWeek, overdue, startDate, endDate);
        String aiContent = callOpenAi(prompt);

        AiReport report = AiReport.builder()
                .user(user)
                .reportType(AiReport.ReportType.WEEKLY)
                .title("Weekly Productivity Report — " + endDate)
                .content(aiContent)
                .summary(extractSummary(aiContent))
                .periodStart(startDate)
                .periodEnd(endDate)
                .build();

        return aiReportRepository.save(report);
    }

    public AiReport generateProjectReport(UUID projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        List<Task> tasks = taskRepository.findByProjectIdOrderByPosition(projectId);
        long done = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count();
        long todo = tasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count();

        String prompt = buildProjectReportPrompt(project, tasks, done, inProgress, todo);
        String aiContent = callOpenAi(prompt);

        AiReport report = AiReport.builder()
                .user(user)
                .project(project)
                .reportType(AiReport.ReportType.PROJECT)
                .title("Project Analysis: " + project.getName())
                .content(aiContent)
                .summary(extractSummary(aiContent))
                .build();

        return aiReportRepository.save(report);
    }

    public Map<String, Object> chat(String message, User user) {
        List<Task> myTasks = taskRepository.findByAssignee(user);
        List<Project> myProjects = projectRepository.findAllByMemberOrOwner(user);

        String context = buildChatContext(user, myTasks, myProjects);
        String fullPrompt = context + "\n\nUser question: " + message;
        String response = callOpenAi(fullPrompt);

        return Map.of(
                "response", response,
                "timestamp", java.time.LocalDateTime.now().toString()
        );
    }

    private String callOpenAi(String prompt) {
        try {
            RestClient client = RestClient.builder()
                    .baseUrl("https://api.openai.com/v1")
                    .defaultHeader("Authorization", "Bearer " + openAiKey)
                    .defaultHeader("Content-Type", "application/json")
                    .build();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", maxTokens,
                    "messages", List.of(
                            Map.of("role", "system", "content",
                                    "You are DevPulse AI, an expert assistant for software development teams. " +
                                    "Provide actionable, concise insights about productivity, project health, " +
                                    "and optimization strategies. Use markdown formatting."),
                            Map.of("role", "user", "content", prompt)
                    )
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = client.post()
                    .uri("/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
                    return (String) msg.get("content");
                }
            }
        } catch (Exception e) {
            log.warn("OpenAI API call failed: {}. Using fallback response.", e.getMessage());
        }

        return generateFallbackReport(prompt);
    }

    private String buildWeeklyReportPrompt(User user, List<Task> allTasks,
            List<Task> completed, long overdue, LocalDate start, LocalDate end) {
        return String.format("""
                Generate a weekly productivity report for developer %s.
                Period: %s to %s
                
                Stats:
                - Total assigned tasks: %d
                - Completed this week: %d
                - Overdue tasks: %d
                - In progress: %d
                
                Task titles completed: %s
                
                Provide:
                1. Executive summary
                2. Key achievements
                3. Areas of concern
                4. Actionable recommendations for next week
                5. Productivity score (0-100) with justification
                """,
                user.getFullName(), start, end,
                allTasks.size(), completed.size(), overdue,
                allTasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count(),
                completed.stream().map(Task::getTitle).limit(10).collect(Collectors.joining(", "))
        );
    }

    private String buildProjectReportPrompt(Project project, List<Task> tasks,
            long done, long inProgress, long todo) {
        return String.format("""
                Analyze the health and progress of software project: %s
                Status: %s | Priority: %s | Progress: %d%%
                
                Task breakdown:
                - Done: %d | In Progress: %d | Todo: %d | Total: %d
                
                Deadline: %s
                
                Provide:
                1. Project health assessment
                2. Risk factors and bottlenecks
                3. Delay probability analysis
                4. Resource allocation suggestions
                5. Next 2-week action plan
                """,
                project.getName(), project.getStatus(), project.getPriority(), project.getProgress(),
                done, inProgress, todo, tasks.size(),
                project.getDeadline() != null ? project.getDeadline().toString() : "Not set"
        );
    }

    private String buildChatContext(User user, List<Task> tasks, List<Project> projects) {
        return String.format("""
                Context for AI assistant:
                Developer: %s
                Active projects: %s
                My tasks: %d total, %d in progress, %d done
                Overdue tasks: %d
                """,
                user.getFullName(),
                projects.stream().map(Project::getName).limit(5).collect(Collectors.joining(", ")),
                tasks.size(),
                tasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count(),
                tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count(),
                tasks.stream().filter(t -> t.getDueDate() != null &&
                        t.getDueDate().isBefore(LocalDate.now()) &&
                        t.getStatus() != Task.Status.DONE).count()
        );
    }

    private String extractSummary(String content) {
        String[] lines = content.split("\n");
        StringBuilder summary = new StringBuilder();
        int count = 0;
        for (String line : lines) {
            if (!line.isBlank() && count < 3) {
                summary.append(line).append(" ");
                count++;
            }
        }
        return summary.toString().trim();
    }

    private String generateFallbackReport(String prompt) {
        return """
                ## AI Analysis Report
                
                > **Note:** AI analysis is currently operating in demo mode. Connect an OpenAI API key for full functionality.
                
                ### Summary
                Based on your current project data, here is a preliminary analysis:
                
                **Key Observations:**
                - Your task completion rate shows consistent progress
                - Multiple projects are running in parallel — consider prioritization
                - Some tasks may benefit from better time estimates
                
                ### Recommendations
                1. **Focus on high-priority tasks** — Ensure critical path items are addressed first
                2. **Review overdue items** — Schedule a backlog grooming session
                3. **Improve estimation accuracy** — Track actual vs estimated hours more closely
                4. **Team communication** — Increase check-in frequency for blocked tasks
                
                ### Productivity Score: 72/100
                Good overall progress with room for optimization in task estimation and prioritization.
                
                *Configure your OpenAI API key in `.env` to enable full AI-powered analysis.*
                """;
    }
}
