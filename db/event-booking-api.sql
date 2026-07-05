-- BE6 Sunday Practical Exam: Event Booking API
-- Run this file before starting the API exam.
-- This script resets only the exam tables: event_registrations and events.

BEGIN;

DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  event_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
  registration_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO events (title, description, location, event_date, capacity, status)
VALUES
  ('Node API Career Night', 'Talk and live coding for junior backend developers', 'Bangkok', '2026-07-12', 80, 'published'),
  ('PostgreSQL Basics Workshop', 'Hands-on SQL workshop for beginners', 'Online', '2026-07-14', 60, 'published'),
  ('Backend Portfolio Review', 'Review API projects and improve portfolio quality', 'Bangkok', '2026-07-18', 30, 'draft'),
  ('DevOps For Backend Developers', 'Intro to deployment, logs, and production mindset', 'Online', '2026-07-21', 100, 'published'),
  ('REST API Interview Practice', 'Mock interview for API design and debugging', 'Bangkok', '2026-07-25', 40, 'published'),
  ('Database Design Clinic', 'Practice turning requirements into database tables', 'Chiang Mai', '2026-08-01', 35, 'draft'),
  ('JavaScript Error Debugging', 'Common Node.js errors and how to read stack traces', 'Online', '2026-08-03', 75, 'published'),
  ('Cloud App Deployment Day', 'Deploy a simple backend API to the cloud', 'Bangkok', '2026-08-08', 50, 'published'),
  ('API Testing With Postman', 'Build a practical API test checklist', 'Online', '2026-08-10', 90, 'published'),
  ('Middleware Deep Dive', 'Practice validation and route-specific middleware', 'Bangkok', '2026-08-15', 45, 'cancelled'),
  ('SQL Query Practice', 'SELECT, WHERE, ORDER BY, LIMIT and OFFSET practice', 'Online', '2026-08-17', 70, 'published'),
  ('Junior Backend Hiring Prep', 'Prepare for take-home assignments and live coding', 'Bangkok', '2026-08-22', 55, 'draft'),
  ('Express Routing Lab', 'Build GET, POST, PUT and DELETE APIs from scratch', 'Online', '2026-08-24', 85, 'published'),
  ('Production API Logging', 'Learn what to log when debugging APIs', 'Bangkok', '2026-08-29', 40, 'published'),
  ('Final Project API Review', 'Review database, validation and response design', 'Online', '2026-09-02', 100, 'published');

INSERT INTO event_registrations (event_id, attendee_name, attendee_email)
VALUES
  (1, 'Mina', 'mina@example.com'),
  (1, 'Tan', 'tan@example.com'),
  (2, 'Ploy', 'ploy@example.com'),
  (4, 'Krit', 'krit@example.com'),
  (5, 'Jane', 'jane@example.com'),
  (5, 'Bank', 'bank@example.com'),
  (8, 'May', 'may@example.com'),
  (9, 'Nok', 'nok@example.com'),
  (11, 'Pim', 'pim@example.com'),
  (13, 'Best', 'best@example.com');

COMMIT;

SELECT COUNT(*) AS total_events
FROM events;

SELECT COUNT(*) AS total_registrations
FROM event_registrations;
