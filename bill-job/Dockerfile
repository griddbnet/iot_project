FROM eclipse-temurin:8-jdk-alpine

ENV CLASSPATH=/src/:/src/gridstore.jar
ADD start.sh /

WORKDIR /src
ADD gridstore.jar /src/
ADD *.java /src
RUN javac *.java

CMD /start.sh
