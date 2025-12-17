-- Allow public read access to the sales table
-- This is necessary because the Lambda uses the Anon Key, which is subject to RLS.

-- Option 1: Add a policy to allow reading
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON sales;

CREATE POLICY "Public Read Access"
ON sales
FOR SELECT
TO public
USING (true);

-- Option 2: If you prefer to just disable RLS (Simple way):
-- ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
