import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Chart from "react-apexcharts";


const App = () => {
  const [meterId, setMeterId] = useState(0);
  const [semaphore, setSemaphore] = useState(true);

  const [xAxis, setXAxis] = useState([]);
  const [yAxis, setYAxis] = useState([]);

  const [billngHistory, setBillingHistory] = useState([]);


  const queryForRows = (endPoint) => {
    var xhr = new XMLHttpRequest();
    console.log("endpoint: ", endPoint)

    xhr.onreadystatechange = function () {

      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        let resp = JSON.parse(xhr.responseText);
        const meter = resp.data.meter
        const bills = resp.data.bill

        // Set up meter data for chart
        const timeArray = []
        const kwhArray = []
        for (let i = 0; i < meter.length; i++) {

          let time = meter[i][0]
          let kwh = meter[i][1].toFixed(2)

          timeArray.push(time);
          kwhArray.push(kwh)
        }
        setXAxis([...timeArray])
        setYAxis([...kwhArray])

      // Set up billing history table
        const billingH = []
        bills.forEach((bill, idx) => {
          let b = {}
          b["date"] = bill[0];
          b["totalKwh"] = bill[1];
          b["amount"] = bill[2];
          b["dailyHistory"] = JSON.parse(bill[3]);
          b["id"] = idx;
          billingH.push(b);
        })
        setBillingHistory(billingH)
      }
    };
    xhr.open('GET', endPoint);
    xhr.send();
  }

  useEffect(() => { // runs when user selects a meterid from the dropdown
    queryForRows(`/devices/${meterId}`);
  }, [meterId])


  useEffect(() => {
    console.log("billngHistory: ", billngHistory)
  }, [billngHistory])


  const handleMeterIdChange = (event) => {
    setMeterId(event.target.value);
  };

  const chartOptions = {
    xaxis: {
      categories: xAxis.slice((xAxis.length - 100), xAxis.length)
    }
  }

  const series = [
    {
      name: "data",
      data: yAxis.slice((yAxis.length - 100), yAxis.length)
    }
  ]


  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Box sx={{
        height: 900,
        width: '50%',
        '& .MuiDataGrid-cell--editable': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#376331' : 'rgb(217 243 190)',
        }
      }}>


        {semaphore ? (


          <>
          <h1> IoT Web App with GERN stack </h1>
            <Stack direction="row" spacing={1}>
              
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Meter Id</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={meterId}
                  label="What Meter Id would you like to see?"
                  onChange={handleMeterIdChange}
                >
                  <MenuItem value={0}>Meter_0</MenuItem>
                  <MenuItem value={1}>Meter_1</MenuItem>
                  <MenuItem value={2}>Meter_2</MenuItem>
                  <MenuItem value={3}>Meter_3</MenuItem>
                  <MenuItem value={4}>Meter_4</MenuItem>
                  <MenuItem value={5}>Meter_5</MenuItem>
                  <MenuItem value={6}>Meter_6</MenuItem>
                  <MenuItem value={7}>Meter_7</MenuItem>
                  <MenuItem value={8}>Meter_8</MenuItem>
                  <MenuItem value={9}>Meter_9</MenuItem>
                </Select>
              </FormControl>
              <Button size="small" variant="outlined" onClick={() => setSemaphore(false)}>
                GO
              </Button>
            </Stack>
          </>

        ) : (
          <>
            <h1> Hello {meterId}. Here is your recent usage:</h1>
            <Stack spacing={2}>
              <Chart
                options={chartOptions}
                series={series}
                type="line"
                width="1000"
              />
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Billing History</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billngHistory.map((rows) => (
                      <TableRow
                        key={rows.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {rows.date}
                        </TableCell>
                        <TableCell align="right">{rows.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </>
        )
        }


      </Box>
    </div>
  )
}

export default App;
