FROM maven:3-jdk-11-slim AS builder
ARG ELK_VERSION=0.7.1
# Build elk-full.jar
COPY pom.xml /app/
WORKDIR app
RUN mvn -Delk.version=$ELK_VERSION install
# Extract and repack war from plantuml-server
COPY --from=plantuml/plantuml-server:jetty /var/lib/jetty/webapps/ROOT.war /app/ROOT.war
RUN jar -uvf ROOT.war WEB-INF/lib/elk-full.jar

# Make result image
FROM plantuml/plantuml-server:jetty
COPY --from=builder /app/ROOT.war /var/lib/jetty/webapps/ROOT.war
