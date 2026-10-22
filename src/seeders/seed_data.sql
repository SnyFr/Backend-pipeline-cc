USE content_creator_tracker_db;


-- 1. Seed Users (Password: Password123!)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Agil Feriski', 'agil@creator.com', '$2b$10$TytmIS8XYe8XjXxHQALL8uyqG2bpdz6y429T1X1cMoMvn8Nxl3ITK', 'creator')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Channels
INSERT INTO channels (id, user_id, platform, handle_name) VALUES
(1, 1, 'youtube', '@agiltech'),
(2, 1, 'instagram', '@agil.dev')
ON DUPLICATE KEY UPDATE handle_name=VALUES(handle_name);

-- 3. Seed Contents (3 Dummy Contents sesuai AC)
INSERT INTO contents (id, user_id, channel_id, title, description, format_type, status, priority, scheduled_date, published_date, published_url) VALUES
(1, 1, 1, 'Tutorial Express.js Clean Architecture', 'Membahas REST API dengan layering rapi', 'long_video', 'scripting', 'high', '2026-11-01', NULL, NULL),
(2, 1, 2, 'Tips Backend Developer 2026', 'Shorts singkat tentang skill wajib', 'short_video', 'idea', 'medium', '2026-11-05', NULL, NULL),
(3, 1, 1, 'Cara Deploy Node.js ke VPS', 'Panduan step by step deploy web app', 'long_video', 'published', 'high', '2026-10-01', '2026-10-01', 'https://youtube.com/watch?v=dummy123')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Seed Checklists (3 item pada konten 3 untuk persiapan TC-04)
INSERT INTO content_checklists (id, content_id, task_name, is_completed) VALUES
(1, 1, 'Riset topik & outline', TRUE),
(2, 1, 'Tulis naskah kodingan', FALSE),
(3, 3, 'Take video rekaman', TRUE),
(4, 3, 'Editing & color grading', TRUE),
(5, 3, 'Buat thumbnail YouTube', TRUE)
ON DUPLICATE KEY UPDATE task_name=VALUES(task_name);

-- 5. Seed Metrics (2 item log metrik pada konten 3 untuk persiapan TC-04)
INSERT INTO content_metrics (id, content_id, recorded_at, views_count, likes_count, comments_count, shares_count) VALUES
(1, 3, '2026-10-02', 1500, 120, 25, 10),
(2, 3, '2026-10-09', 4200, 350, 68, 45)
ON DUPLICATE KEY UPDATE views_count=VALUES(views_count);