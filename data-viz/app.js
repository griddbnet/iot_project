const { config } = require('dotenv');
const express = require('express');
const path = require('path');
const griddb = require('griddb-node-api');
var bodyParser = require('body-parser')

const app = express();
var jsonParser = bodyParser.json()

app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(express.static(path.resolve(__dirname, 'frontend/build')));

var factory = griddb.StoreFactory.getInstance();
store = factory.getStore({
    "notificationMember": process.argv[2],
    "clusterName": process.argv[3],
    "username": process.argv[4],
    "password": process.argv[5]
});

// const conInfo = containerName => new griddb.ContainerInfo({
//     'name': containerName,
//     'columnInfoList': [
//         ["kwh", griddb.Type.DOUBLE],
//         ["temp", griddb.Type.DOUBLE],
//     ],
//     'type': griddb.ContainerType.COLLECTION, 'rowKey': true
// });


const queryCont = async (containerName, queryStr) => {

    var data = []
    try {
        const col = await store.getContainer(containerName)
        const query = await col.query(queryStr)
        const rs = await query.fetch(query)
        while (rs.hasNext()) {
            data.push(rs.next())
        }
        return data
    } catch (error) {
        console.log("error querying container: ", error)
    }
}

const queryAgg = async (containerName, queryStr) => {

    var data;
    try {
        const col = await store.getContainer(containerName)
        const query = await col.query(queryStr)
        const rs = await query.fetch(query)
        while (rs.hasNext()) {
            aggregation = rs.next();
            data = aggregation.get(griddb.Type.TIMESTAMP);
        }
        return data
    } catch (error) {
        console.log("error querying container: ", error)
    }
}


app.get('/devices/:meterId', async (req, res) => {
    try {
        let containerName = "meter_" + req.params.meterId
        let queryStr = "select * from " + containerName

        let containerNameBill = "bill_" + req.params.meterId
        let queryStrBill = "select * from " + containerNameBill

        var results = await queryCont(containerName, queryStr)
        var resultsBill = await queryCont(containerNameBill, queryStrBill)

        let queryForMaxTime = "select MAX(timestamp);"
        let queryForMinTime = "select MIN(timestamp);"
        var minTime = await queryAgg(containerName, queryForMinTime)
        var maxTime = await queryAgg(containerName, queryForMaxTime)
        let timeArr = [minTime, maxTime]

        console.log("minTime, maxTime", minTime, maxTime)

        var data = {};
        data["meter"] = results
        data["bill"] = resultsBill
        data["minMax"] = timeArr;

        res.json({
            data
        });
    } catch (error) {
        console.log("try error: ", error)
    }
});

app.get('/meters', async (req, res) => {
    try {
        var results = await queryCont("meters", "select *;")

        res.json({
            results
        });
    } catch (error) {
        console.log("try error: ", error)
    }
});

app.get('/startAndEnd', async (req, res) => {
    try {

        let start = req.query.start;
        let end = req.query.end;
        let containerName = req.query.device

        console.log(start, end, containerName)
       
        //let queryStr = `select * where timestamp BETWEEN TIMESTAMP('${start}') AND TIMESTAMP('${end}')`
        let queryStr = `select * where timestamp > TIMESTAMP('${start}') and timestamp < TIMESTAMP('${end}')`
        console.log(queryStr)

        var results = await queryCont(containerName, queryStr)

        var data = {};
        data["range"] = results

        res.json({
            data
        });
    } catch (error) {
        console.log("try error: ", error)
    }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 2828;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
