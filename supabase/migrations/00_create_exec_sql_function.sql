-- Create the exec_sql function with appropriate permissions
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;