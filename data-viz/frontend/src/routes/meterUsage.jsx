
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import '../index.css';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Chart from "react-apexcharts";

import { useParams, Link } from "react-router-dom";

const dateRemoveTime = (dt) => {
  let stringFormatDate = new Date(dt).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })
  return stringFormatDate
}

const dateKeepTime = (dt) => {
  let stringFormatDate = new Date(dt).toLocaleDateString('en-us', { hour: "2-digit", minute: "numeric" })
  return stringFormatDate
}

const removeExtraDigits = (amount) => {
  let amountFloat = Number(amount.replace(/[^0-9.-]+/g, ""));
  let shorterAmountStr = amountFloat.toFixed(2);
  let addDollarSign = '$' + shorterAmountStr;
  return addDollarSign;
}

const isInt = (value) => {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

const convertDateToStr = date => {
  return date.toISOString()
}

const findFromDate = (startDate, endDate, data) => {

  let sd = convertDateToStr(startDate)
  let ed = convertDateToStr(endDate)

  console.log("sd, ed: ", sd, ed)

  let startIdx = data.indexOf(sd)
  let endIdx = data.indexOf(ed)



  console.log("Start Index, End Endex: ", startIdx, endIdx)
  // return plots
}

const App = () => {

  const [startMinMax, setStartMinMax] = useState([])
  const [endMinMax, setEndMinMax] = useState([])
  const [ms, setMs] = useState(0)
  const { meterId } = useParams()

  useEffect(() => {
    queryForRows(`/devices/${meterId}`);
  }, [meterId])

  const [billngHistory, setBillingHistory] = useState([]);

  const [plotPoints, setPlotPoints] = useState({
    "x": ['2022-11-24T16:36:45.030Z'],
    "y": [3.68]
  })


  const getRange = (start, end, device) => {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        let resp = JSON.parse(xhr.responseText);
        const data = resp.data.range

        const points = { "x": [], "y": [] }
        data.forEach((val) => {
          points["x"].push(dateKeepTime(val[0]))
          points["y"].push(val[1].toFixed(2))
        })
        setPlotPoints(points)
      }

    }

    if (start !== null && end !== null) {
      let container = "meter_" + device
      xhr.open('GET', `/startAndEnd?start=${start}&end=${end}&device=${container}`);
      xhr.send();
    }

  }


  const queryForRows = (endPoint) => {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        let resp = JSON.parse(xhr.responseText);
        const meter = resp.data.meter

        const bills = resp.data.bill
        const mm = resp.data.minMax
        let min = new Date(mm[0])
        let max = new Date(mm[1])

        let milli = min.getMilliseconds(); //need milliseconds to add to all time-based queries from the date picker
        setMs(milli)

        setStartDate(min)
        setEndDate(max)

        setStartMinMax([min, max])
        setEndMinMax([min, max])

        // Set up billing history table
        const billingH = []
        bills.forEach((bill) => {
          let b = {}
          b["date"] = bill[0];
          b["totalKwh"] = bill[1];
          b["amount"] = bill[2];
          b["dailyHistory"] = JSON.parse(bill[3]);
          billingH.push(b);
        })
        setBillingHistory(billingH)
      }
    };
    xhr.open('GET', endPoint);
    xhr.send();
  }

  const chartOptions = {
    xaxis: {
      categories: plotPoints["x"]
    }
  }

  const series = [
    {
      name: "data",
      data: plotPoints["y"]
    }
  ]

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [startDateRange, setStartDateRange] = useState(null)
  const [endDateRange, setEndDateRange] = useState(null)

  const changeStart = (start) => {
    setStartDate(start);
    start.setMilliseconds(ms)
    let convertedDate = convertDateToStr(start)
    setStartDateRange(convertedDate)
    getRange(startDateRange, endDateRange, meterId)

  };

  const changeEnd = (end) => {
    setEndDate(end);
    end.setMilliseconds(ms)
    let convertedDate = convertDateToStr(end)
    setEndDateRange(convertedDate)
    getRange(startDateRange, endDateRange, meterId)
  };


  return (
    <div style={{ display: "flex", justifyContent: "center"}} className="bg-color">
      <Box sx={{
        height: 900,
        width: '50%',
        '& .MuiDataGrid-cell--editable': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#376331' : 'rgb(217 243 190)',
        }
      }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" to="/">
            Home
          </Link>
          <Typography color="text.primary">Meter Usage</Typography>
        </Breadcrumbs>
        <Stack spacing={1}>

          <>
            <h2> Displaying recent usage for Meter_{meterId}</h2>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>

                <DatePicker
                  selected={startDate}
                  onChange={changeStart}
                  placeholderText='Pick a start date and time'
                  showTimeSelect
                  timeIntervals={60}
                  minDate={startMinMax[0]}
                  maxDate={startMinMax[1]}
                  dateFormat="MMMM d, yyyy h:mm aa"
                />

                <DatePicker
                  selected={endDate}
                  onChange={changeEnd}
                  showTimeSelect
                  timeIntervals={60}
                  placeholderText='Pick an end date and time'
                  minDate={endMinMax[0]}
                  maxDate={endMinMax[1]}
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Alert severity="warning">
                  <AlertTitle>Hint</AlertTitle>
                  Try to keep the range under a week
                </Alert>
                <Alert severity="warning">
                  <AlertTitle>Hint</AlertTitle>
                  You must select both a day and a time in both selection dropdowns
                </Alert>
              </Stack>
              <Chart
                options={chartOptions}
                series={series}
                type="line"
              />
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: "2rem" }}>Billing History</TableCell>
                      <TableCell sx={{ fontSize: "2rem" }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billngHistory.map((rows, idx) => (
                      <TableRow key={idx}>
                        <TableCell component="th" scope="row" sx={{ fontSize: "1.3rem" }}>
                          <Link
                            to={`/billing/${meterId}/${rows.date}`}
                            state={{
                              BillingHistory: billngHistory,
                              index: idx
                            }}
                          >
                            {dateRemoveTime(rows.date)}
                          </Link>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: "1.3rem", borderLeft: "1px dotted lightgray", width: "229px" }}
                        >
                          {removeExtraDigits(rows.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </>
        </Stack>
      </Box>
    </div>
  )
}

export default App;



