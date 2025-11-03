import { useState, useEffect, use, act } from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { BarChart } from '@mui/x-charts/BarChart';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [servicereq, setServicereq] = useState([]);
  const [incidents_esc, setIncidents_esc] = useState([]);
  const [activeinc, setActiveinc] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [enableGraph, setStateGraph] = useState(false)
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
      console.log(data)
      // ✅ Filter only "active" service requests
      const active_data = data.filter((item) => item.Status === "Active" || item.Active === true);

      const sorted = [...data].sort((a, b) => Number(b.ServiceReqNumber) - Number(a.ServiceReqNumber));
      setServicereq(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
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
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchIncidents();
        fetchServiceReq();
        fetchEscIncidents();
        fetchActiveIncidents();
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
          <span>Refreshes every 1 minute</span>
          <span>Last Refresh:</span>
          <span>{lastRefresh}</span>
      </div>
      
      <div className="App">
{/* 

// TODO Play a sound when a escalated ticket is fetched
// TODO for escalted tickets component add a field of the latest change to the ticket otherwise put No recent changes
// TODO add a graph of the amount of tickets per person

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

          {!loading && !error && (
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Service Req</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {servicereq.map((sr) => (
                    <tr key={sr.RecId}>
                      <td><b>{sr.ServiceReqNumber}</b></td>
                      <td>{sr.Subject}</td>
                      <td>{sr.Status}</td>
                      <td>{sr.Owner}</td>
                      <td>{sr.Symptom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
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
          {(!loading && !error) && enableGraph ?
            (<BarChart
              xAxis={[
                {
                  id: 'barCategories',
                  data: Object.keys(activeinc),
                }
              ]}
              series={[
                {
                  data: Object.values(activeinc),
                }
              ]}
              
              height={300}
            />)
            :
            (<ul>
              {Object.entries(activeinc).map((entry,index)=>(
                <li>
                  {entry[0]} - {entry[1]}
                </li>
              ))}
              </ul>
            )
                     
        }
        
          <button className={enableGraph ? 'toggleGraph_active' : "toggleGraph"} onClick={() => (setStateGraph(!enableGraph))}>Toggle Graph</button>
        </div>
        
      </div>
      </>
  );
}

export default App;
