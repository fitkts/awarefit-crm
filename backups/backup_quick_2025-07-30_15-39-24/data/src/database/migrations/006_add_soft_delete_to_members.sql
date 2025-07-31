ALTER TABLE members
ADD COLUMN deleted_at DATETIME;
CREATE INDEX idx_members_deleted_at ON members(deleted_at);