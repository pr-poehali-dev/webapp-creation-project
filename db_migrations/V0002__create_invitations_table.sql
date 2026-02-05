CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'manager',
    invited_by INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    CONSTRAINT chk_invitation_role CHECK (role IN ('admin', 'manager', 'viewer')),
    CONSTRAINT chk_invitation_status CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    CONSTRAINT fk_invitation_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_invitation_invited_by FOREIGN KEY (invited_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_organization ON invitations(organization_id, status);