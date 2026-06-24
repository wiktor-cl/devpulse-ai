-- DevPulse AI - Seed Data
-- Passwords are bcrypt of 'Password123!'

INSERT INTO users (id, email, username, password, full_name, role, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@devpulse.ai', 'admin',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEeDNH5XQ5qiXYe', 'DevPulse Admin', 'ADMIN', true),
  ('a0000000-0000-0000-0000-000000000002', 'john.doe@devpulse.ai', 'johndoe',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEeDNH5XQ5qiXYe', 'John Doe', 'USER', true),
  ('a0000000-0000-0000-0000-000000000003', 'jane.smith@devpulse.ai', 'janesmith',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEeDNH5XQ5qiXYe', 'Jane Smith', 'USER', true),
  ('a0000000-0000-0000-0000-000000000004', 'bob.builder@devpulse.ai', 'bobbuilder',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewEeDNH5XQ5qiXYe', 'Bob Builder', 'USER', true);

INSERT INTO projects (id, name, description, status, priority, owner_id, deadline, progress, color, repository_url) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'DevPulse Platform', 'Core platform development and AI integration', 'ACTIVE', 'CRITICAL',
   'a0000000-0000-0000-0000-000000000001', '2024-12-31', 65, '#6366f1', 'https://github.com/devpulse/platform'),
  ('b0000000-0000-0000-0000-000000000002', 'Mobile App', 'React Native mobile companion app', 'PLANNING', 'HIGH',
   'a0000000-0000-0000-0000-000000000002', '2025-03-31', 15, '#8b5cf6', 'https://github.com/devpulse/mobile'),
  ('b0000000-0000-0000-0000-000000000003', 'Data Pipeline', 'Analytics and metrics ingestion pipeline', 'ACTIVE', 'MEDIUM',
   'a0000000-0000-0000-0000-000000000003', '2025-01-31', 40, '#06b6d4', 'https://github.com/devpulse/pipeline'),
  ('b0000000-0000-0000-0000-000000000004', 'API Gateway', 'Microservices API gateway and rate limiting', 'COMPLETED', 'HIGH',
   'a0000000-0000-0000-0000-000000000001', '2024-09-30', 100, '#10b981', 'https://github.com/devpulse/gateway');

INSERT INTO project_members (project_id, user_id, role) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'OWNER'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'ADMIN'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'MEMBER'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'OWNER'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'MEMBER'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'OWNER'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'OWNER');

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, reporter_id, due_date, estimated_hours, actual_hours, position) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Implement JWT authentication', 'Set up Spring Security with JWT tokens, refresh token rotation, and blacklisting', 'DONE', 'CRITICAL',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2024-10-15', 8.0, 9.5, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Design database schema', 'ERD design, normalization, and Flyway migration scripts', 'DONE', 'HIGH',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2024-10-10', 6.0, 5.5, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Build AI analytics module', 'OpenAI integration for productivity analysis and report generation', 'IN_PROGRESS', 'HIGH',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2024-11-30', 16.0, 8.0, 3),
  ('c0000000-0000-0000-0000-000000000004', 'WebSocket notifications', 'Real-time notification system using STOMP over WebSockets', 'IN_PROGRESS', 'MEDIUM',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2024-11-20', 10.0, 4.0, 4),
  ('c0000000-0000-0000-0000-000000000005', 'Frontend Kanban board', 'Drag and drop task management with React DnD', 'TODO', 'HIGH',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2024-12-15', 12.0, null, 5),
  ('c0000000-0000-0000-0000-000000000006', 'Write integration tests', 'Testcontainers-based integration tests for all API endpoints', 'TODO', 'MEDIUM',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2024-12-20', 14.0, null, 6),
  ('c0000000-0000-0000-0000-000000000007', 'Setup CI/CD pipeline', 'GitHub Actions with Docker build, test, and deploy stages', 'IN_REVIEW', 'HIGH',
   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2024-11-15', 6.0, 5.0, 7),
  ('c0000000-0000-0000-0000-000000000008', 'Mobile app wireframes', 'Low-fidelity wireframes for all screens', 'TODO', 'MEDIUM',
   'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '2024-12-01', 8.0, null, 1);

INSERT INTO task_tags (task_id, tag) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'security'), ('c0000000-0000-0000-0000-000000000001', 'backend'),
  ('c0000000-0000-0000-0000-000000000002', 'database'), ('c0000000-0000-0000-0000-000000000002', 'design'),
  ('c0000000-0000-0000-0000-000000000003', 'ai'), ('c0000000-0000-0000-0000-000000000003', 'backend'),
  ('c0000000-0000-0000-0000-000000000004', 'realtime'), ('c0000000-0000-0000-0000-000000000004', 'backend'),
  ('c0000000-0000-0000-0000-000000000005', 'frontend'), ('c0000000-0000-0000-0000-000000000005', 'ui'),
  ('c0000000-0000-0000-0000-000000000006', 'testing'), ('c0000000-0000-0000-0000-000000000007', 'devops');

INSERT INTO notifications (user_id, type, title, message, is_read, link) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'TASK_ASSIGNED', 'New task assigned', 'You have been assigned to "WebSocket notifications"', false, '/tasks/c0000000-0000-0000-0000-000000000004'),
  ('a0000000-0000-0000-0000-000000000003', 'TASK_DUE_SOON', 'Task due soon', '"Build AI analytics module" is due in 3 days', false, '/tasks/c0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000001', 'PROJECT_UPDATE', 'Project update', 'API Gateway project has been marked as completed', true, '/projects/b0000000-0000-0000-0000-000000000004');
