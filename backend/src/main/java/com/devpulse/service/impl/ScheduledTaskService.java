package com.devpulse.service.impl;

import com.devpulse.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTaskService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final CacheManager cacheManager;

    /**
     * Clean expired refresh tokens daily at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanExpiredRefreshTokens() {
        log.info("Running scheduled cleanup of expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens();
        log.info("Expired refresh token cleanup complete");
    }

    /**
     * Evict dashboard caches every 5 minutes to refresh stats
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void evictDashboardCaches() {
        var cache = cacheManager.getCache("dashboard");
        if (cache != null) {
            cache.clear();
            log.debug("Dashboard cache evicted");
        }
    }
}
