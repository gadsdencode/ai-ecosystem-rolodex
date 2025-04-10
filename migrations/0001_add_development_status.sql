-- Add development_status column to ai_tools table
ALTER TABLE ai_tools ADD COLUMN development_status text NOT NULL DEFAULT 'production';

-- Update specific apps to be in development status
UPDATE ai_tools 
SET development_status = 'development'
WHERE name IN ('BloqMain', 'CareCompanion', 'ComplianceAI', 'Grokie'); 