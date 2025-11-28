import { useState, useEffect, use, act } from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart, pieArcLabelClasses, legendClasses, chartsAxisClasses } from '@mui/x-charts';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [incidents_esc, setIncidents_esc] = useState([]);
  const [activeinc, setActiveinc] = useState([]);
  const [resolvedinc, setResolvedinc] = useState([]);
  const [priorityCounts, setpriorityCounts] = useState([]);
  const [latestCI, setLatestCI] = useState(null);
  const [totalW11, setTotalW11] = useState(null)


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [enableGraph, setStateGraph] = useState(false)
  const [enableSRGraph, setSRGraph] = useState(false)
  const [isAuthenticated, setIsAuthentication] = useState(false);
  const itemsPerPage = 10;
  const [sid, setSid] = useState("");

  

  const sendSID = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/incidents', {
        params: { sid: sid }
      });
      if (response.status === 200) {
        localStorage.setItem("SID", sid);
        setSid(sid);
        setIsAuthentication(true);
      } else {
        setError("Invalid SID");
        setIsAuthentication(false);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check SID or server.");
    }
  };

  const fetchIncidents = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/incidents', {
        params: { sid: sid }
      });
      const data = response.data.value || response.data;
      const sorted = [...data].sort((a, b) => Number(b.IncidentNumber) - Number(a.IncidentNumber));
      setIncidents(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
      
    
    const responsew11 = await axios.get('http://localhost:5000/api/W11Q', {
        params: { sid: sid }
      });
    setTotalW11(responsew11.data.value.length)
    
      


      // TODO Fix the data fetch for number of incidents by priority
      // activeinc.forEach(item => {
      //   const counts = {};
      //   console.log(item)
      //   const key = `priority ${item.Priority}`; // or item.Priority depending on API
      //   counts[key] = (counts[key] || 0) + 1;
      // });
      // console.log(counts)

    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

    const fetchEscIncidents = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/incidents_esc', {
        params: { sid: sid }
      });
      const data = response.data.value || response.data;
      const sorted = [...data].sort((a, b) => Number(b.IncidentNumber) - Number(a.IncidentNumber));
      setIncidents_esc(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
    } catch (err) {
      console.error('Error fetching esc incidents:', err);
      setError('Failed to fetch esc incidents');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveIncidents = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      await axios.get('http://localhost:5000/api/activeIncidents', {
        params: { sid: sid }
      })
      .then((res) => {
        const c = {};
  
        res.data.value.forEach((inc) => {
          const owner = inc.Owner;
          c[owner] = (c[owner] || 0) + 1; // Initialize and increment count
        });

        

        setActiveinc(c);
        console.log("Counts:", c); // log the built dictionary directly
      })
    } catch (err) {
      console.error('Error fetching active incidents:', err);
      setError('Failed to fetch active incidents');
    } finally {
      setLoading(false);
    }
  };

  const fetchResolvedperOwner = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const date_obj = new Date()
      const new_date = date_obj.getFullYear()+"-"+(date_obj.getMonth()+1).toString().padStart(2,0)+"-"+date_obj.getDate().toString().padStart(2,0)
      const response = await axios.get('http://localhost:5000/api/resolved_incidents_today', {
        params: { sid: sid, date:new_date }
      });
      const ownerRes = {}
      const ownerData = response.data.value || {}
      try{
        ownerData.forEach((inc) => {
        if (inc.Owner !== null){
          ownerRes[inc.Owner] = (ownerRes[inc.Owner] || 0) + 1; // Initialize and increment count
        }
      });

      const ownerResData = Object.entries(ownerRes).map(([key, value]) => ({
        id: key,
        value,
        label: key + " - " + value,
      }));
      // TODO from the incidents fetched, sort them in a dictionary for each owner and the amount of resolved tickets assigned
      setResolvedinc(ownerResData); // ✅ show top 10 only
      console.log(ownerResData)
    } catch (err){
      console.log("test")
    }
      
    } catch (err) {
      console.error('Error fetching resolved incidents:', err);
      setError('Failed to fetch resolved incidents');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestCI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/latest_CI', {
        params: { sid: sid }
      });
      
      
      const current_number = response.data.value[0].Name
      const prefix = current_number.slice(0, 2);      // "KR"
      const number = parseInt(current_number.slice(2, 7), 10); // 00001 → 1

      const nextNumber = String(number + 1).padStart(5, "0");

      const latest_number = `${prefix}${nextNumber}`

      setLatestCI(latest_number)

      console.log(latest_number)

      

    } catch (err) {
      console.error('Error fetching latest CI:', err);
      setError('Failed to fetch latest CI');
    } finally {
      setLoading(false);
    }
};

  const fetchCIbyOS = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/CIbyOS', {
        params: { sid: sid },
      });
      const data = response.data
      console.log(data)

    } catch (err) {
      console.error('Error fetching latest CI:', err);
      setError('Failed to fetch latest CI');
    } finally {
      setLoading(false);
    }
};


 
  


  useEffect(() => {
    const response = axios.get('http://localhost:5000/api/incidents', {
      params: { sid: localStorage.getItem("SID") }
      }).then((res)=>{
      if (res.status === 200) {
        setSid(localStorage.getItem("SID"))
        setIsAuthentication(true);
    
      } else {
        setError("Invalid SID");
        setIsAuthentication(false);
      }
    })
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents();
      fetchEscIncidents();
      fetchActiveIncidents();
      fetchResolvedperOwner();
      fetchLatestCI();
      fetchCIbyOS();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchIncidents();
        fetchEscIncidents();
        fetchActiveIncidents();
        fetchResolvedperOwner();
        fetchLatestCI();
        fetchCIbyOS();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);


  return (
    !isAuthenticated ?
      <div className="login-container">
        <h2>Login</h2>
        <input
          id="SID-input"
          type="text"
          placeholder="Enter SID"
          value={sid}
          onChange={(e) => setSid(e.target.value)}
        />
        <button onClick={sendSID}>Log In</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      :
      <>
      <div className='top-element'>
            {loading && <p>Loading top element...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
              <div className='topinfo'>
                <h3> Total W11 Queue: {totalW11}</h3>
                
              </div>
            )}
      </div>


       
      
      
      <div className="App">
        <div className='section'>
          <h2 className='section-title'>Resolved Tickets Today</h2>

          {loading && <p>Loading Resolved Tickets...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <>
              <PieChart
              
              series={[{ 
                innerRadius: 60,
                outerRadius: 120,
                data: resolvedinc,
                arcLabel: 'value',
                paddingAngle: 5,
                cornerRadius: 5
                
                }]}
              sx={{
                  [`& .${legendClasses.label}`]: {
                    color:"white"
                  },
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',   // 👈 your text color
                    fontSize: 20,
                    fontWeight: 'bold',
                    border:'2px solid rgba(0, 0, 0, 0.1)',
                    
                  },
                }}
              height={300}
              width={500}
            />
            </>
          )}
        </div>

        <div className='section'>
          <h2 className='section-title'>Next Available KR</h2>
          {loading && <p>Loading KR...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <h1>{latestCI} </h1>
          )}
          
        </div>
        

        <div className='section'>
          <h2 className='section-title'>
            Escalated W11 Incidents
            <p>Total: {incidents_esc.length}</p>
          </h2>
          

          {loading && <p>Loading escalated incidents...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Owner</th>
                    <th>Last Changed</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents_esc.map((incident) => (
                    <tr key={incident.RecId}>
                      <td><b>{incident.IncidentNumber}</b></td>
                      <td>{incident.Subject}</td>
                      <td>{incident.Status}</td>
                      <td>{incident.Priority}</td>
                      <td>{incident.Owner}</td>
                      <td>
                        <p>{incident.LastModDateTime.split("T")[0]}</p>
                        <p>{incident.LastModDateTime.split("T")[1].split("Z")[0].split("+")[0]}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
          <div className='section'>
            <h2 className='section-title'>Team's Active Incidents by Owner</h2>

            {loading && <p>Loading Active Tickets...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: Object.keys(activeinc),
                  label: "Owner",
                }
              ]}
              series={[
                {
                  data: Object.values(activeinc),
                  label: "Active Incidents",
                  barLabel: true,
                }
              ]}
              height={200}
              width={600}
              margin={{ top: 40, right: 20, bottom: 40, left: 60 }}

              sx={{
                "& .MuiChartsAxis-tickLabel": { fill: "white" },
                "& .MuiChartsLegend-root": { color: "white" },
              }}

            />
            
          </div>
      

        <div className='section'>
          
        </div>
        
        

        
      </div>
      </>
  );
}

export default App;
