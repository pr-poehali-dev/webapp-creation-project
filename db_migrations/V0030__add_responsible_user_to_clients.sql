-- Add responsible_user_id column to clients table
ALTER TABLE clients ADD COLUMN responsible_user_id INTEGER;

-- Add foreign key constraint
ALTER TABLE clients ADD CONSTRAINT fk_clients_responsible_user 
  FOREIGN KEY (responsible_user_id) REFERENCES users(id);

-- Set responsible_user_id to created_by for existing records
UPDATE clients SET responsible_user_id = created_by WHERE responsible_user_id IS NULL;

-- Create index for faster lookups
CREATE INDEX idx_clients_responsible_user_id ON clients(responsible_user_id);