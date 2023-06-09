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
            "notification.member": "griddb-server:10001",
        	"user": "admin",
        	"password": "admin",
        	"topics.regex": "meter.(.*)",
        	"transforms": "TimestampConverter",
        	"transforms.TimestampConverter.type": "org.apache.kafka.connect.transforms.TimestampConverter$Value",
        	"transforms.TimestampConverter.format": "yyyy-MM-dd hh:mm:ss.SSS",
        	"transforms.TimestampConverter.field": "timestamp",
        	"transforms.TimestampConverter.target.type": "Timestamp"
    	}
}'
