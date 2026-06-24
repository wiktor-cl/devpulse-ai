package com.devpulse.websocket;

import com.devpulse.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    /**
     * Ping/pong heartbeat endpoint for WS keep-alive
     * Client sends to /app/ping, gets back on /topic/pong
     */
    @MessageMapping("/ping")
    @SendTo("/topic/pong")
    public Map<String, Object> ping(Principal principal) {
        log.debug("WebSocket ping from: {}", principal != null ? principal.getName() : "anonymous");
        return Map.of(
                "type", "PONG",
                "timestamp", LocalDateTime.now().toString()
        );
    }
}
