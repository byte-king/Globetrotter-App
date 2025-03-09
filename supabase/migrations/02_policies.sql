-- Create policies
CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable read access for scores" ON scores
    FOR SELECT
    TO public
    USING (true);

-- Grant future table permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO anon, authenticated;