package com.devpulse.repository;

import com.devpulse.entity.AiReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AiReportRepository extends JpaRepository<AiReport, UUID> {
    Page<AiReport> findByUserIdOrderByGeneratedAtDesc(UUID userId, Pageable pageable);
    Page<AiReport> findByUserIdAndProjectIdOrderByGeneratedAtDesc(UUID userId, UUID projectId, Pageable pageable);
}
