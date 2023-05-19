from confluentinc/cp-kafka-connect-base:6.2.0

user root

COPY config/griddb-sink.json /
RUN curl -XPOST -H 'Content-Type: application/json' http://localhost:8083/connectors -d @/griddb-sink.json
