-- First, let's check if the user exists
select id, email, role 
from profiles 
where email = 'nachofrosty@gmail.com';

-- If the user exists, update their role to ADMIN
update profiles
set role = 'ADMIN'
where email = 'nachofrosty@gmail.com';

-- Verify the update was successful
select id, email, role 
from profiles 
where email = 'nachofrosty@gmail.com';

-- Drop existing policy if it exists
drop policy if exists "Users can update own profile" on profiles;

-- Create new policy
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;