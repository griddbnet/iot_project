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

Will register 10 devices and generate 100 days of data for them.

$ docker-compose build gateway-sim
$ docker-compose run gateway-sim 


## Run Bill Job

Will generate one bill for meter_1

$ docker-compose build bill-job
$ docker-compose run bill-job
