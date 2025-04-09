FROM openjdk:17
ARG JAR_FILE=target/kartingBackend.jar
COPY ${JAR_FILE} kartingBackend.jar
ENTRYPOINT ["java", "-jar", "/kartingBackend.jar"]
