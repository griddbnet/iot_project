#!/usr/bin/python3

from kafka import KafkaProducer
import json
import datetime
import time as t
import logging
import random


logging.basicConfig(format='%(asctime)s %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    filename='producer.log',
                    filemode='w')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

####################
p=KafkaProducer(bootstrap_servers=['broker:9092'])
print('Kafka Producer has been initiated...')
#####################
def receipt(err,msg):
    if err is not None:
        print('Error: {}'.format(err))
    else:
        message = 'Produced message on topic {} with value of {}\n'.format(msg.topic(), msg.value().decode('utf-8'))
        logger.info(message)
        print(message)
        
#####################
def main():
    for i in range(10):
        time = datetime.datetime.now()
        now = time.strftime('%Y-%m-%d %H:%M:%S.%f')
        data= {
            "payload": 
            {
                'ts': now,
                'sensor': 'device10',
                'co': random.uniform(0, 1),
                'humidity': random.uniform(1, 100),
                'light': random.choice([True, False]),
                'lpg': random.uniform(0, 1),
                'motion': random.choice([True, False]), 
                'smoke': random.uniform(0, 1),
                'temp': random.uniform(1, 33) 
            },
            "schema": 
            {
                "fields": [ 
                    { "field": "ts", "optional": False, "type": "string" },
                    { "field": "sensor", "optional": False, "type": "string" }, 
                    { "field": "co", "optional": False, "type": "double" }, 
                    { "field": "humidity", "optional": False, "type": "double" }, 
                    { "field": "light", "optional": False, "type": "boolean" }, 
                    { "field": "lpg", "optional": False, "type": "double" }, 
                    { "field": "motion", "optional": False, "type": "boolean" }, 
                    { "field": "smoke", "optional": False, "type": "double" }, 
                    { "field": "temp", "optional": False, "type": "double" } 
                ], 
                "name": "iot", "optional": False, "type": "struct" 
            }    
         }


        m=json.dumps(data, indent=4, sort_keys=True, default=str)
        p.send('device7', m.encode('utf-8'))
        print("sent message")
        t.sleep(3)
        
if __name__ == '__main__':
    main()
