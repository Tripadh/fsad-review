# CertiTracker Spring Boot Backend

This folder contains a separate Spring Boot backend service for the CertiTracker app.

## Stack
- Spring Boot 3.4
- Spring Data JPA
- MySQL
- BCrypt password hashing

## Run
1. Open MySQL Workbench and run [db/workbench-setup.sql](db/workbench-setup.sql) to create the `certitracker` database.
2. Update `src/main/resources/application.properties` if needed, or set:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
3. From this folder run:
   - `mvn spring-boot:run`

The backend starts on `http://localhost:8080` and exposes APIs under `/api`.

If your local MySQL user is not `root`, update the username and password in `src/main/resources/application.properties` before starting the backend.
