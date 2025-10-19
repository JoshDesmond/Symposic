BEGIN;

-- Insert profiles with UUIDs
INSERT INTO profiles (profile_id, phone) VALUES 
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '+15551234567'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '+15559876543');

-- Insert profile data
INSERT INTO profile_data (profile_id, first_name, last_name, city, state) VALUES 
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Alice', 'Anderson', 'San Francisco', 'CA'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Bob', 'Bobberson', 'Austin', 'TX');

-- Insert interviews
INSERT INTO interviews (profile_id, interview_data) VALUES 
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '{"messages": [{"role": "assistant", "content": "Hello! This is Alice''s example interview. I love coding and building amazing things! My favorite color is purple and I enjoy long walks on the beach."}]}'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '{"messages": [{"role": "assistant", "content": "Greetings! Bob here with a totally real interview. I''m passionate about technology, tacos, and teaching robots to dance. This is definitely not generated test data. Wink wink."}]}');

COMMIT;