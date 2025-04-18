FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} kartingBackend.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "/kartingBackend.jar"]
