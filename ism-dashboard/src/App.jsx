import { useState, useEffect, use, act } from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart, pieArcLabelClasses, legendClasses, chartsAxisClasses } from '@mui/x-charts';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [servicereq, setServicereq] = useState([]);
  const [serviceCount, setServiceCount] = useState([]);
  const [incidents_esc, setIncidents_esc] = useState([]);
  const [activeinc, setActiveinc] = useState([]);
  const [resolvedinc, setResolvedinc] = useState([]);
  const [priorityCounts, setpriorityCounts] = useState([]);


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

  const fetchServiceReq = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/sr', {
        params: { sid: sid }
      });
      const data = response.data.value || response.data;
      // ✅ Filter only "active" service requests
      // const active_data = data.filter((item) => item.Status === "Active" || item.Active === true);

      const sorted = [...data].sort((a, b) => Number(b.ServiceReqNumber) - Number(a.ServiceReqNumber));
      setServicereq(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
      if (sorted.length > 0){
        const c = {}

        response.data.value.forEach((inc) => {
          const owner = inc.Owner;
          c[owner] = (c[owner] || 0) + 1; // Initialize and increment count
        });
        setServiceCount(c)
      }
      else{
        setServiceCount({})
      }
      
    } catch (err) {
      console.error('Error fetching sr:', err);
      setError('Failed to fetch sr');
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
      const response = await axios.get('http://localhost:5000/api/resolved_incidents_today', {
        params: { sid: sid }
      });
      const ownerRes = {}
      response.data.value.forEach((inc) => {
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
    } catch (err) {
      console.error('Error fetching resolved incidents:', err);
      setError('Failed to fetch resolved incidents');
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
      fetchServiceReq();
      fetchEscIncidents();
      fetchActiveIncidents();
      fetchResolvedperOwner();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchIncidents();
        fetchServiceReq();
        fetchEscIncidents();
        fetchActiveIncidents();
        fetchResolvedperOwner();
        
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
      <div className='lastRefresh' > 
          <h3>Refreshes every 1 minute - Last Refresh: {lastRefresh}</h3>
      </div>
      
      <div className="App">
{/* 
Fi

 */}
        <div className='section'>
          
          

          {loading && <p>Loading incidents...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <>
              <h2>Unassigned Active W11 Incidents</h2>
              <span>Total:  {incidents.length}</span>
              
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.RecId}>
                      <td><b>{incident.IncidentNumber}</b></td>
                      <td>{incident.Subject}</td>
                      <td>{incident.Status}</td>
                      <td>{incident.Priority}</td>
                      <td>{incident.Owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className='section'>
          <h2>Service Requests</h2>
          <span>Total: {servicereq.length}</span>

          {loading && <p>Loading service requests...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && enableSRGraph ? (
            <BarChart
              xAxis={[
                {
                  id: 'barCategories',
                  data: Object.keys(serviceCount),
                }
              ]}
              series={[
                {
                  data: Object.values(serviceCount),
                }
              ]}
              
              height={300}
            />
          ):(
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Service Req</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {servicereq.map((sr) => (
                    <tr key={sr.RecId}>
                      <td><b>{sr.ServiceReqNumber}</b></td>
                      <td>{sr.Subject}</td>
                      <td>{sr.Status}</td>
                      <td>{sr.Owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
            
          )}
           <button className={enableSRGraph ? 'toggleSRGraph_active' : "toggleSRGraph"} onClick={() => (setSRGraph(!enableSRGraph))}>Toggle Graph</button>
        
        </div>

        <div className='section'>
          <h2>Escalated W11 Incidents</h2>
          <span>Total: {incidents_esc.length}</span>

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
          <h2>Team's Active Incidents by Owner</h2>
          {loading && <p>Loading service requests...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {/* //TODO if the amount of incidetns are over 20, make the bar amber, if 25 or over made it red  */}
          {!loading && !error && 
            <table>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Active Incidents</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(activeinc).map(([key, value], index) => (
                  <tr key={index}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>        
          }
        </div>

        <div className='section'>
          <h2>Resolved Tickets Today</h2>

          {loading && <p>Loading service requests...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <>
              <PieChart
              
              series={[{ innerRadius: 50, outerRadius: 100, data: resolvedinc, arcLabel: 'value' }]}
              sx={{
                  [`& .${legendClasses.label}`]: {
                    color:"white"
                  },
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',   // 👈 your text color
                    fontSize: 18,
                    fontWeight: 'bold',
                  },
                }}
              height={300}
            />
            </>
          )}
        </div>

        {/* <div className='section'>
          <h2>Ticket Priority</h2>
          <span>Total: {servicereq.length}</span>

          {loading && <p>Loading service requests...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && (
            <>
              <PieChart
              
              series={[
                {
                  data: resolvedinc,
                }
              ]}
              
              height={300}
            />
            </>
          )}
        </div>
         */}
      </div>
      </>
  );
}

export default App;
