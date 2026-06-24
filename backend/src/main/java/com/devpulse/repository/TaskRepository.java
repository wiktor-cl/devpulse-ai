package com.devpulse.repository;

import com.devpulse.entity.Task;
import com.devpulse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdOrderByPosition(UUID projectId);

    Page<Task> findByProjectId(UUID projectId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.assignee = :user AND t.archived = false ORDER BY t.dueDate ASC NULLS LAST")
    List<Task> findByAssignee(@Param("user") User user);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.archived = false AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findFiltered(
        @Param("projectId") UUID projectId,
        @Param("status") Task.Status status,
        @Param("priority") Task.Priority priority,
        @Param("search") String search,
        Pageable pageable
    );

    long countByProjectId(UUID projectId);

    long countByProjectIdAndStatus(UUID projectId, Task.Status status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee = :user AND t.status != 'DONE' AND t.status != 'CANCELLED'")
    long countActiveTasksByUser(@Param("user") User user);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee = :user AND t.status = 'DONE'")
    long countCompletedTasksByUser(@Param("user") User user);
}
