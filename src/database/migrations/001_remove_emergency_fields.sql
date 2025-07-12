-- Migration: Remove emergency contact fields from members table
-- Created: 2024-01-01
-- Description: Remove emergency_contact and emergency_phone fields as they are no longer used in the UI

-- This migration is currently disabled to avoid transaction conflicts
-- The emergency fields will remain in the database but are not used in the UI
-- This is a safe approach until a proper migration strategy is implemented

-- No-op migration - just mark as completed
SELECT 1 as migration_completed; 