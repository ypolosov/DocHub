FROM openjdk:11 AS builder

RUN mkdir -p /build/WEB-INF/lib
COPY elk-full.jar /build/WEB-INF/lib/elk-full.jar

WORKDIR /build

COPY --from=plantuml/plantuml-server:jetty /var/lib/jetty/webapps/ROOT.war /build/ROOT.war

RUN jar -uvf ROOT.war WEB-INF/lib/elk-full.jar

FROM plantuml/plantuml-server:jetty
COPY --from=builder /build/ROOT.war /var/lib/jetty/webapps/ROOT.war
