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
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=OwnerTeam eq 'Windows 11 Project' and Status eq 'Active' and Owner eq '$NULL'&$top=100",
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
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/servicereqs?$select=ServiceReqNumber,Subject,Status,Owner,Symptom&$top=100",
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
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=CE_Escalated eq true and OwnerTeam eq 'Windows 11 Project' and Status eq 'Active'&$top=100",
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
    const response = await axios.get(
      "https://itservicedesk.kht.local/HEAT/api/odata/businessobject/Incidents?$filter=OwnerTeam eq 'Windows 11 Project' and Status eq 'Active' and Owner ne '$NULL'&$top=100",
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


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
