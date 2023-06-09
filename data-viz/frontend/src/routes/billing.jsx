import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { useLocation, Link } from 'react-router-dom'

import Chart from "react-apexcharts";

const removeExtraDigits = (amount) => {
  let amountFloat = Number(amount.replace(/[^0-9.-]+/g, ""));
  let shorterAmountStr = amountFloat.toFixed(2);
  let addDollarSign = '$' + shorterAmountStr;
  return addDollarSign;
}

const App = () => {
  const location = useLocation() 
  const { BillingHistory, index } = location.state

  const [dateForHeader, setDateForHeader] = useState("01/01/2023")
  const [dailyValues, setDailyValues] = useState([]);

  useEffect(() => {
    let stringFormatDate = new Date(BillingHistory[index].date).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })
    setDateForHeader(stringFormatDate)


    let dv = [];
    BillingHistory[index].dailyHistory.forEach(val => {
      let temp = val.toFixed(2)
      temp = parseFloat(temp);
      dv.push(temp)
    })

    setDailyValues(dv)
  }, [])


  const chartOptions = {
    xaxis: {
      // creates array for length of array of daily points
      categories: Array.from(new Array(BillingHistory[index]["dailyHistory"].length), (x, i) => i)
    }
  }

  const series = [
    {
      name: "data",
      data: dailyValues
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

        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" to="/">
            Home
          </Link>
          <Typography color="text.primary">Billing</Typography>
        </Breadcrumbs>

        <h1> {dateForHeader} </h1>


        <Stack direction="row" spacing={1}>
          <Chart
            options={chartOptions}
            series={series}
            type="line"
            width="1000"
          />
          <Stack spacing={3}>
            <h3>Total kWh: <br />{(BillingHistory[index].totalKwh).toFixed(2)}</h3>
            <h3> Amount: <br /> {removeExtraDigits(BillingHistory[index].amount)}</h3>
          </Stack>

        </Stack>




      </Box>
    </div>
  )
}

export default App;
