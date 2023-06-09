import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import '../index.css';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { Link } from "react-router-dom";


const App = () => {
  const [meterId, setMeterId] = useState(0);
  const [meters, setMeters] = useState([]);

  const handleMeterIdChange = (event) => {
    setMeterId(event.target.value);
  };

  useEffect(() => {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        let resp = JSON.parse(xhr.responseText);
        const meters = resp.results
        console.log("meters: ", meters)
        setMeters(meters)
    
      }
    };
    xhr.open('GET', "/meters");
    xhr.send();

  },[])



  return (
    <div className="bg-color" style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh"
    }}>
      <Box sx={{
        width: '53%',
        boxShadow:'0px 4px 16px -5px',
        position:'.4em',

      }}>

        <Stack spacing={1}>
          <FormControl sx={{ m: 2, p: 2 }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={meterId}
              label="Meter"
              onChange={handleMeterIdChange}
              sx={{fontSize:"2rem"}}
            >
              {meters.map((meter) => 
                <MenuItem key={meter[0]} value={meter[0]}>Meter_{meter[0]}</MenuItem>
              )}
            </Select>
          </FormControl>
        </Stack>
        <Stack spacing={1} direction="row" alignItems="center" justifyContent="center">
            <Link to={{
              pathname: `/meterUsage/${meterId}`,
            }}
            >
              <Button sx={{ m: 3, fontSize:"1.6rem"}} variant="contained">
                GO
              </Button>
            </Link>
          </Stack>
      </Box>
    </div>
  )
}

export default App;
