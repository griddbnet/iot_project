# Getting Started

First you may need to run a build command to build the griddb-server image from its dockerfile

$ docker-compose build

$ docker-compose up -d

## Check if Sink Config exists

The sink is sent via docker-compose file

$ curl http://localhost:8083/connectors 

## View Topics

docker exec -it broker  kafka-console-consumer --bootstrap-server broker:9092  --topic device7  --from-beginning


## Run Kafka Producer

$ python3 gateway-sim/kafka_producer.py

## Check GridDB Server Contents

drop into griddb shell: 

$ docker exec -it griddb-server gs_sh

gs> select * from device7;
