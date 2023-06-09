#!/bin/sh

cd /src

export CLASSPATH=:/src/gridstore.jar
echo ARGS $@
java GenerateBill $@
