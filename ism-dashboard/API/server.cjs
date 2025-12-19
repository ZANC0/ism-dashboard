// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
// Allow requests from your React dev server
app.use(cors());
app.use('/', express.static('dist'))

// Create HTTPS agent that ignores invalid/self-signed certs
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignore SSL certificate errors
});


  

app.get('/api/incidents', async (req, res) => {
  try {
    const sid = req.query.sid
    // Active Windows 11 Incidents
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=(OwnerTeam eq 'Desktop Support' or OwnerTeam eq 'Windows 11 Project') and Status eq 'Active' and Owner eq '$NULL'&$top=100",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching incidents from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.get('/api/queue', async (req, res) => {
  try {
    const sid = req.query.sid
    // Active Windows 11 Incidents
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=(OwnerTeam eq 'Desktop Support' or OwnerTeam eq 'Windows 11 Project') and Status eq 'Active'&$top=100",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching incidents from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.get('/api/sr', async (req, res) => {
  try {
    const sid = req.query.sid
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/servicereqs?$select=ServiceReqNumber,Status,Subject,Owner&$filter=(OwnerTeam eq 'Windows 11 Project' or OwnerTeam eq 'Desktop Support') and Status eq 'Active' and Subject eq 'IT Equipment Order - IT Use Only'",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching sr from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch srs' });
  }
});

app.get('/api/incidents_esc', async (req, res) => {
  try {
    const sid = req.query.sid
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=(OwnerTeam eq 'Desktop Support' or OwnerTeam eq 'Windows 11 Project') and CE_Escalated eq true and Status eq 'Active'&$top=100",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching esc incidents from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch esc incidents' });
  }
});

app.get('/api/activeIncidents', async (req, res) => {
  try {
    const sid = req.query.sid
    const new_date = req.query.date
    const response = await axios.get(
      `https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=(OwnerTeam eq 'Desktop Support' or OwnerTeam eq 'Windows 11 Project') and (Status eq 'Active') and (CreatedDateTime ge ${new_date}T00:00:00Z)`,
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching active incidents from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch active incidents' });
  }
});

app.get('/api/resolved_incidents_today', async (req, res) => {
  try {
    const sid = req.query.sid
    const new_date = req.query.date
    // Active Windows 11 Incidents
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=(OwnerTeam eq 'Desktop Support' or OwnerTeam eq 'Windows 11 Project') and ResolvedDateTime ge "+new_date+""+"T00:00:00Z&$top=100",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching resolved incidents from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch resolved incidents' });
  }
});

app.get('/api/latest_CI', async (req, res) => {
  try {
    const sid = req.query.sid
    // Active Windows 11 Incidents
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/CIs?$search=KR0&$orderby=Name desc",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching lastest CI from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch lastest CI' });
  }
});

app.get('/api/Cis/kr', async (req, res) => {
  try {
    const sid = req.query.sid
    const kr = req.query.kr
    // Active Windows 11 Incidents
    const total_res = await axios.get(
      `https://itservicedesk.kht.local/HEAT/api/odata/businessobject/CIs?$filter=(Status eq 'Stock' or Status eq 'Allocated Stock')&$select=Name, Model, Status&$orderby=Name&$search=${kr}&$top=100`,
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(total_res.data)
  } catch (err) {
    console.error('Error fetching lastest CI from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch lastest CI' });
  }
});

app.get('/api/Cis/kh', async (req, res) => {
  try {
    const sid = req.query.sid
    const kh = req.query.kh
    // Active Windows 11 Incidents
    const total_res = await axios.get(
      `https://itservicedesk.kht.local/HEAT/api/odata/businessobject/CIs?$filter=(Status eq 'Stock' or Status eq 'Allocated Stock')&$select=Name, Model, Status&$orderby=Name&$search=${kh}&$top=100`,
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(total_res.data)
  } catch (err) {
    console.error('Error fetching lastest CI from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch lastest CI' });
  }
});

app.get('/api/Cis/lap', async (req, res) => {
  try {
    const sid = req.query.sid
    const lap = req.query.lap
    // Active Windows 11 Incidents
    const total_res = await axios.get(
      `https://itservicedesk.kht.local/HEAT/api/odata/businessobject/CIs?$filter=(Status eq 'Stock' or Status eq 'Allocated Stock')&$select=Name, Model, Status&$orderby=Name&$search=${lap}&$top=100`,
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(total_res.data)
  } catch (err) {
    console.error('Error fetching lastest CI from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch lastest CI' });
  }
});

app.post('/UMSapi', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username)

    // Create HTTPS agent to allow self-signed cert
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await axios.post(
      "https://10.51.84.159:8443/umsapi/v3/login",
      {
        
      },
      {
        httpsAgent,
        auth:{
          username: username,
          password: password
        },
        headers: { "Content-Type": "application/json" }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error('Error fetching login details from UMS API:', err.message);
    res.status(500).json({ error: 'Error fetching login details from UMS API' });
  }
});

app.get('/UMSapi/getDeviceStatus', async (req, res) => {
  try {
    const sid = req.query.sid
    // Active Windows 11 Incidents
    const response = await axios.get(
      "https://10.51.84.159:8443/umsapi/v3/thinclients?facets=online",
      {
        headers: {
          Cookie: sid, // your SID
        },
        // use agent to ignore SSL errors
        httpsAgent, // use agent to ignore SSL errors
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching getDeviceStatus from USM API:', err.message);
    res.status(500).json({ error: 'Error fetching getDeviceStatus from USM API' });
  }
});

app.get('/api/VIPIncidents', async (req, res) => {
  try {
    const sid = req.query.sid
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=(OwnerTeam eq 'Desktop Support' or OwnerTeam eq 'Windows 11 Project') and (Status eq 'Active') and (isVIP eq true)&$top=100",
      {
        headers: {
          Cookie: `SID=${sid}` // your SID
        },
        httpsAgent, // use agent to ignore SSL errors
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching VIP tickets from server:', err.message);
    res.status(500).json({ error: 'Failed to fetch VIP tickets' });
  }
});



app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
