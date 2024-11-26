-- Update the first user to be an admin
update profiles
set role = 'ADMIN'
where email = 'nachofrosty@gmail.com';

-- Verify the update
select id, email, role from profiles
where email = 'nachofrosty@gmail.com';