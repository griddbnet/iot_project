#!/bin/sh

curl -s \
     -X "POST" "http://localhost:8083/connectors/" \
     -H "Content-Type: application/json" \
     -d '{
	    "name": "griddb-kafka-sink",
    	"config": {
        	"connector.class": "com.github.griddb.kafka.connect.GriddbSinkConnector",
        	"name": "griddb-kafka-sink",
        	"cluster.name": "myCluster",
        	"user": "admin",
        	"password": "admin",
        	"topics": "device7,device8,device9,device10",
        	"transforms": "TimestampConverter",
        	"transforms.TimestampConverter.type": "org.apache.kafka.connect.transforms.TimestampConverter$Value",
        	"transforms.TimestampConverter.format": "yyyy-MM-dd hh:mm:ss.SSS",
        	"transforms.TimestampConverter.field": "ts",
        	"transforms.TimestampConverter.target.type": "Timestamp"
    	}
}'
