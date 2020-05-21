# Lets Connect

## __Description__
- Platform to connect people of different culture, society and views.
- Application is based on NodeJS, Express JS, MongoDB majorly.
- Application is based on MVC pattern, so that one can easily navigate through code.
- Custom Middlewares include to prevent DRY.


## __List Of Modules__
### A). Authentication 
1. Register
2. Login
3. Current Logged In User
4. Forget Password
5. Reset Password
6. Update Password
7. Logout

### B). Users
1. Only Admin Can Access
2. Role Based Users [user, admin etc]
3. Create User
4. Update User
5. Get User
6. Delete User

## __List Of Middlewares__
1. AR: To ease mongoose queries
2. Async : So we do not have to write try{ } catch{ } in every function
3. Auth : To authenticate user based on roles
4. Error : Custom error handler

## Security Measures
1. Prevent NoSql Injections
2. XSS Protection
3. Rate Limiting
4. HPP
5. CORS

## Deployment Platform
[Heroku](https://www.heroku.com) \
[MongoDB](https://www.mongodb.com)

### Docgen
> docgen.exe build -i Lets_Connect.postman_collection.json -o index.html
>