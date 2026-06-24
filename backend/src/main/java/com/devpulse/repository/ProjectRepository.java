package com.devpulse.repository;

import com.devpulse.entity.Project;
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
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT p FROM Project p WHERE p.owner = :user OR :user MEMBER OF p.members ORDER BY p.updatedAt DESC")
    Page<Project> findByMemberOrOwner(@Param("user") User user, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.owner = :user OR :user MEMBER OF p.members")
    List<Project> findAllByMemberOrOwner(@Param("user") User user);

    @Query("SELECT p FROM Project p WHERE (p.owner = :user OR :user MEMBER OF p.members) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:priority IS NULL OR p.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Project> findFiltered(
        @Param("user") User user,
        @Param("status") Project.Status status,
        @Param("priority") Project.Priority priority,
        @Param("search") String search,
        Pageable pageable
    );

    long countByOwner(User owner);
}
