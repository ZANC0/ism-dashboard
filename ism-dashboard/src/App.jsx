import { useState, useEffect, use, act, useMemo } from 'react';
import axios from 'axios';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { PieChart, pieArcLabelClasses, legendClasses, chartsAxisClasses } from '@mui/x-charts';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,Pie,Cell   } from 'recharts';
import { fontSize } from '@mui/system';
import { useTheme, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useAnimate, useAnimateBar, useDrawingArea } from '@mui/x-charts/hooks';
import { PiecewiseColorLegend } from '@mui/x-charts/ChartsLegend';
import { interpolateObject } from '@mui/x-charts-vendor/d3-interpolate';


import login1 from "./assets/login1.png"
import login2 from "./assets/login2.png"
import login3 from "./assets/login3.png"
import login4 from "./assets/login4.png"
import esc_sound from "./assets/woop.mp3"
import isReadimg from "./assets/isread.png"

function App() {
  const [incidents, setIncidents] = useState([]);
  const [incidents_esc, setIncidents_esc] = useState([]);
  const [vipIncidents, setVipIncidents] = useState([]);
  const [activeinc, setActiveinc] = useState([]);
  const [resolvedinc, setResolvedinc] = useState([]);
  const [latestCI, setLatestCI] = useState(null);
  const [totalQueue, setTotalQueue] = useState(null)
  const [igelDeviceStatus,setIgelDeviceStatus] = useState([])
  const [stockCount, setStockCount] = useState([{"model":"none","quantity":0}])
  const [srs, setSrs] = useState([])
  const [srAll, setSrAll] = useState([])
  const [previousEscCount, setPreviousEscCount] = useState(0)

  // Loading States
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState([false, ""])
  const [stockLoading, setStockLoading] = useState(true)
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthentication] = useState(false);
  const [dateState, setDateState] = useState(new Date())

  const [lastRefresh, setLastRefresh] = useState(null);
  
  const itemsPerPage = 10;
  const coloredData = igelDeviceStatus.map((item) => ({
    ...item,
    color: item.name === 'Online' ? '#4caf50' : '#f44336', // green/red
  }));
  const [ismSID, setISMSID] = useState("");
  const [igelusername, setIgelusername] = useState("");
  const [igelpword, setigelpword] = useState("");
  const [igelsid, setigelsid] = useState("");
  const date = new Date()
  const audio = new Audio(esc_sound);
  

  const sendSID = async () => {
    try {
      setLoginLoading([true, "Testing ISM SID"])
      const ISMresponse = await axios.get('http://localhost:5000/api/incidents', {
        params: { sid: ismSID }
      });
      setLoginLoading([true, "Validating IGEL Credentdials"])
      const IGELResponse = await axios.post('http://localhost:5000/UMSapi', {
        username: igelusername,
        password: igelpword 
      });
      setLoginLoading(false, "")
      if (ISMresponse.status === 200 && IGELResponse.status === 200) {
        localStorage.setItem("ismSID", ismSID);
        localStorage.setItem("igelSID", IGELResponse.data.message);
        setigelsid(IGELResponse.data.message);
        setIsAuthentication(true);
      } else {
        setError("Invalid SID");
        setIsAuthentication(false);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check ismSID or server.");
    }
  };

  const fetchIncidents = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/incidents', {
        params: { sid: ismSID }
      });
      const data = response.data.value || response.data;
      const sorted = [...data].sort((a, b) => Number(b.IncidentNumber) - Number(a.IncidentNumber));
      setIncidents(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
      
    
    const res = await axios.get('http://localhost:5000/api/queue', {
        params: { sid: ismSID }
      });
    setTotalQueue(res.data.value.length)
    
      


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
    setPreviousEscCount(incidents_esc.length)
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/incidents_esc', {
        params: { sid: ismSID }
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

// AUDIO
  // useEffect(() => {
  //   if(incidents_esc.length > previousEscCount){
  //     audio.play()
  //   } else{
  //     completed_esc_audio.play()
  //   }

  // }, [incidents_esc.length])

  const fetchSrEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/sr', {
        params: { sid: ismSID }
      });
      const data = response.data.value || response.data;
      const sorted = [...data].sort((a, b) => Number(b.IncidentNumber) - Number(a.IncidentNumber));
      setSrs(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
    } catch (err) {
      console.error('Error fetching SR :', err);
      setError('Failed to fetch SR');
    } finally {
      setLoading(false);
    }
  };

  const fetchSrAll = async () => {
    const date_obj = new Date()
    setLoading(true);
    setError(null);
    try {
      const new_date = date_obj.getFullYear()+"-"+(date_obj.getMonth()+1).toString().padStart(2,0)+"-"+date_obj.getDate().toString().padStart(2,0)
      const response = await axios.get('http://localhost:5000/api/srAll', {
        params: { sid: ismSID, date:new_date  }
      });
      const data = response.data.value || response.data;
      const sorted = [...data].sort((a, b) => Number(b.IncidentNumber) - Number(a.IncidentNumber));
      setSrAll(sorted.slice(0, itemsPerPage)); // ✅ show top 10 only
    } catch (err) {
      console.error('Error fetching All SR :', err);
      setError('Failed to fetch All SR');
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
      const date_obj = new Date()
      const new_date = date_obj.getFullYear()+"-"+(date_obj.getMonth()+1).toString().padStart(2,0)+"-"+date_obj.getDate().toString().padStart(2,0)

      await axios.get('http://localhost:5000/api/activeIncidents', {
        params: { sid: ismSID, date: new_date }
      })
      .then((res) => {
       
      const data = res.data.value || []
      setActiveinc(data);
      
      console.log(data)

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
      const ownerRes = {}
      const date_obj = new Date()
      const new_date = date_obj.getFullYear()+"-"+(date_obj.getMonth()+1).toString().padStart(2,0)+"-"+date_obj.getDate().toString().padStart(2,0)
      
      const srresponse = await axios.get('http://localhost:5000/api/srAll', {
        params: { sid: ismSID, date:new_date  }
      });
      const data = srresponse.data.value || srresponse.data;
      const srdata = [...data].sort((a, b) => Number(b.IncidentNumber) - Number(a.IncidentNumber));
      console.log(srdata)




      const response = await axios.get('http://localhost:5000/api/resolved_incidents_today', {
        params: { sid: ismSID, date:new_date }
      });
      
      const ownerData = response.data.value || {}
      try{
        ownerData.forEach((inc) => {
        if (inc.Owner !== null){
          ownerRes[inc.Owner] = (ownerRes[inc.Owner] || 0) + 1; // Initialize and increment count
        }
        
      });
      console.log(srdata)
        srdata.forEach((inc) => {
          if (inc.Owner !== null){
            console.log(inc.Owner)
            ownerRes[inc.Owner] = (ownerRes[inc.Owner] || 0) + 1; // Initialize and increment count
          }})

      const ownerResData = Object.entries(ownerRes).map(([key, value]) => ({
        id: key,
        value,
        label: key + " - " + value,
      }));
      // TODO from the incidents fetched, sort them in a dictionary for each owner and the amount of resolved tickets assigned
      
      setResolvedinc(ownerResData);
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

    try {
      const response = await axios.get('http://localhost:5000/api/latest_CI', {
        params: { sid: ismSID }
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
  const fetchStockCount = async () => {
  // TODO Edit the fetching stock method from search for each set of 100 KRs, configure the api to search the quantity of each model
  
  setStockLoading(true)
  setError(null);

  const batchSize = 1;
  const maxKr = 34;

  let allResults = [];

  try {
    // Start at KR00100, KR00200, ..., KR03400
    for (let start = 0; start <= maxKr; start += batchSize) {
      const kr = `KR${String(start).padStart(3, "0")}`;
      // const kh = `KH${String(start).padStart(1, "0")}`;
      // const lap = `LAP${String(start).padStart(1, "0")}`;
      const kr_response = await axios.get("http://localhost:5000/api/CIs/kr", {
        params: {
          sid: ismSID,
          kr: kr
        }
      });
      // const kh_response = await axios.get("http://localhost:5000/api/CIs/kh", {
      //   params: {
      //     sid: ismSID,
      //     kh: kh
      //   }
      // });
      // const lap_response = await axios.get("http://localhost:5000/api/CIs/lap", {
      //   params: {
      //     sid: ismSID,
      //     lap: lap
      //   }
      // });

      const kr_results = kr_response.data?.value || [];
      // const kh_results = kh_response.data?.value || [];
      // const lap_results = lap_response.data?.value || [];

      console.log(`Fetched ${kr_results.length} CIs for ${kr}`);
      // console.log(`Fetched ${kh_results.length} CIs for ${kh}`);
      // console.log(`Fetched ${lap_results.length} CIs for ${lap}`);

      allResults.push(...kr_results);
      // allResults.push(...kh_results);
      // allResults.push(...lap_results);

      // Safety exit if no results returned
      if (kr_results.length === 0) break;
    }
    
    const map = new Map();

    for (let i = 0; i < allResults.length; i++) {
      const model = String(allResults[i].Model).toLocaleUpperCase() ?? "Unknown";

      map.set(model, (map.get(model) || 0) + 1);
      // ! Override slim pro count
      map.set("pro slim qcs1250".toLocaleUpperCase(), 95)
    }
   const dataset = Array.from(map.entries())
  .map(([model, quantity]) => ({ model, quantity }))
  .sort((a, b) => b.quantity - a.quantity);

    setStockLoading(false);
    setStockCount(dataset)
    console.log(dataset)
    

  } catch (err) {
    console.error("Error fetching CIs:", err);
    setError("Failed to fetch CI list");
  } finally {
    setLoading(false);
  }
};

  const fetchDeviceStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/UMSapi/getDeviceStatus', {
        params: { sid: igelsid },
      });
      
      const devices = response.data || [];

      // Count total online and offline devices
      let onlineCount = 0;
      let offlineCount = 0;

      devices.forEach((device) => {
        if (device.online) onlineCount += 1;
        else offlineCount += 1;
      });

      // Prepare chart data for PieChart
      const chartData = [
        { name: 'Online', value: onlineCount },
        { name: 'Offline', value: offlineCount },
      ];

      setIgelDeviceStatus(chartData);
    } catch (err) {
      console.error("Failed to fetch device status",err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVIPTickets = async () => {
    const date = new Date();
    setLastRefresh(date.getHours() + ':' + date.getMinutes() + ":" + date.getSeconds());
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/VIPIncidents', {
        params: { sid: ismSID }
      });
      console.log(response)
      const data = response.data.value || [];

      setVipIncidents(data); // ✅ show top 10 only
    } catch (err) {
      console.error('Error VIP incidents:', err);
      setError('Failed to VIP  incidents');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const ISMresponse = await axios.get('http://localhost:5000/api/incidents', {
        params: { sid: localStorage.getItem("ismSID") }
      });
      const IGELResponse = await axios.get('http://localhost:5000/UMSapi/getDeviceStatus', {
        params: { sid: localStorage.getItem("igelSID") },
      });
      
      if(ISMresponse.status == 200 && IGELResponse.status == 200){
        setigelsid(localStorage.getItem("igelSID"))
        setISMSID(localStorage.getItem("ismSID"))
        setIsAuthentication(true)
      } else{
        localStorage.clear("igelSID")
        localStorage.clear("ismSID")
        setIsAuthentication(false)
      }

    } catch (err) {
      console.error('Please log in, session expired:', err);
    } finally {
      setLoading(false);
    }
};

const slides = [
  {
    image: login1,
    caption: "Press Ctrl + Shift + I to open Developer Tools"
  },
  {
    image: login2,
    caption: "Click on '+' and Navigate to the Application Tab"
  },
  {
    image: login3,
    caption: "Navigate to the Cookies tab"
  },
  {
    image: login4,
    caption:
      'Click on SID, Bottom right: copy the SID value (e.g. "itservicedesk.kht.local#") and paste it into the ISM SID box'
  }
];

const priorityColors = 
  {
    1:"#b50000ff",
  
    2:"#e25e00ff",
  
    3:"#69a100ff",
  
    4:"#00a6ffff",
    5:"transparent"
  }


const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };


// CHECK SID AUTH
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidents();
      fetchEscIncidents();
      fetchActiveIncidents();
      fetchResolvedperOwner();
      fetchLatestCI();
      fetchStockCount();
      fetchDeviceStatus();
      fetchSrEquipment();
      fetchVIPTickets();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval1 = setInterval(() => {
        fetchIncidents();
        fetchEscIncidents();
        fetchActiveIncidents();
      }, 60000); 
      const interval2 = setInterval(() => {
        fetchResolvedperOwner();
        fetchLatestCI();
        fetchDeviceStatus();
        fetchVIPTickets();
        
      }, 30000);
      const interval3 = setInterval(() => {
        fetchStockCount();
        fetchSrEquipment();
      }, 300000); // refreshes every 5 seconds 
      return () => clearInterval(interval1,interval2,interval3);
      
    }
  }, [isAuthenticated]);


  return (
    loginLoading[0] ? 
    (
      <div className='loginLoading'>
        {loginLoading[1]}
      </div>
    )
    :
    !isAuthenticated ?
    <div className='login-con'>
      <div className="login-container">
        <h2>ISM SID</h2>
        <input
          id="SID-input"
          type="text"
          placeholder="Enter SID"
          value={ismSID}
          onChange={(e) => setISMSID(e.target.value)}
        />
        

        <h2>IGEL UMS Login</h2>
        <input
          id="IGELUSERNAME"
          type="text"
          placeholder="Enter SID"
          value={igelusername}
          onChange={(e) => setIgelusername(e.target.value)}
        />
        <input
          id="IGELPWORD"
          type="password"
          placeholder="Enter SID"
          value={igelpword}
          onChange={(e) => setigelpword(e.target.value)}
        />
        <button onClick={() => {sendSID(); audio.pause()}}>Log In</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        
      </div>
        <div className="loginHelpContainer">
          <img
            className="loginHelp"
            src={slides[currentSlide].image}
            alt="Login help step"
          />
          <p className="loginCaption">{slides[currentSlide].caption}</p>

          <div className="loginControls">
            <button onClick={prevSlide}>Previous</button>
            <span>
              {currentSlide + 1} / {slides.length}
            </span>
            <button onClick={nextSlide}>Next</button>
          </div>
        </div>
      </div>
      :
      <>
      <div className='top-element'>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!error && (
              <div className='topinfo'>
                <h2> Total Tickets: {totalQueue}</h2>
                <h1></h1>
                <h2> New Calls Today: {activeinc.length}</h2>
              </div>
            )}
      </div>
      <div className="App">
        <div className='section'>
          <h2 className='section-title'>Resolved Tickets Today</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!error && (
            <>
              <PieChart
              
              series={[{ 
                innerRadius: 40,
                outerRadius: 80,
                data: resolvedinc,
                arcLabel: 'value',
                paddingAngle: 5,
                cornerRadius: 5,
                }]}
              sx={{
                  [`& .${legendClasses.label}`]: {
                    color:"white",
                    fontSize:20,
                    margin:"5px"
                  },
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: 'white',   // 👈 your text color
                    fontSize: 20,
                    fontWeight: 'bold',
                    border:'2px solid rgba(0, 0, 0, 0.1)',
                    
                  },
                }}
              height={200}
              width={300}
            />
            </>
          )}
        </div>

        
        

        <div className='section'>
          <h2 className='section-title'>
            Escalated Incidents
            <p>Total: {incidents_esc.length}</p>
          </h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!error && (
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Subject</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents_esc.map((incident) => (
                    <tr key={incident.RecId} style={{backgroundColor:priorityColors[incident.Priority]}}>
                      <td><b>{incident.IncidentNumber}</b></td>
                      <td>{incident.Subject}</td>
                      <td>{incident.Owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
         

        

        <div className="section">
              <h2 className="section-title">IGEL Online/Offline</h2>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!error && igelDeviceStatus.length > 0 && (
                <PieChart
                  series={[
                    {
                      innerRadius: 40,
                      outerRadius: 80,
                      data: coloredData,
                      arcLabel: 'value', // shows the value on the arcs
                      paddingAngle: 5,
                      cornerRadius: 5,
                    },
                  ]}
                  sx={{
                    [`& .${legendClasses.label}`]: {
                      color: 'white',   // legend text color
                      fontSize: 9,
                    },
                    [`& .${pieArcLabelClasses.root}`]: {
                      fill: 'white',    // arc label color
                      fontSize: 16,
                      fontWeight: 'bold',
                    },
                  }}
                  height={200}
                  width={200}
                >
                  <Legend 
                    position="bottom" 
                    sx={{ color: 'white', fontSize: 30 }}
                  />
                </PieChart>
              )}
            </div>
         {/* <div className='section'>
            <h2 className='section-title'>Team's Active Incidents by Owner</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <BarChart
              width={450}
              height={150}
              data={activeinc}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              
              <CartesianGrid stroke="#444" strokeDasharray="3 3" />
              
              
              <XAxis dataKey="name" stroke="#fff" fontSize={15} angle={-10}/>
              <YAxis stroke="#fff" />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', borderColor: '#555', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              
              <Legend wrapperStyle={{ color: '#fff' }} />
              
              <Bar dataKey="pv" barSize={30} fill="#ff4d2eff">
                <LabelList dataKey="pv" position="top" fill="#fff" fontSize={20} />
              </Bar>
            </BarChart>
          </div>
         */}
        
        

        <div className='section'>
          <h2 className='section-title'>Hardware Stock</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {stockLoading && <p style={{color: 'white'}}>Loading Stock counts...</p>}
          {!error && (
          <>
          <BarChart width={500} height={500} data={stockCount} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} >
            <CartesianGrid stroke="#444" strokeDasharray="3 3" /> {/* Quantity axis */} 
            <XAxis type="number" stroke="#fff" fontSize={12} /> {/* Model axis */}
            <YAxis type="category" dataKey="model" stroke="#fff" fontSize={12} width={120} /> 
            <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#555', color: '#fff', }} itemStyle={{ color: '#fff' }} /> 
            <Legend wrapperStyle={{ color: '#fff' }} /> <Bar dataKey="quantity" barSize={30} fill="#4dabf7"> 
              <LabelList dataKey="quantity" position="right" fill="#fff" fontSize={14} /> 
            </Bar> 
            </BarChart>
            </>
          )}
          
        </div>

        <div className='section'>
          <h2 className='section-title'>
            VIP Incidents
            <p>Total: {vipIncidents.length}</p>
          </h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!error && (
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>VIP</th>
                    <th>Incident</th>
                    <th>Subject</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {vipIncidents.map((incident) => (
                    <tr key={incident.RecId} style={{backgroundColor:priorityColors[incident.Priority]}}>
                      <td>{incident.ProfileFullName}</td>
                      <td><b>{incident.IncidentNumber}</b></td>
                      <td>{incident.Subject}</td>
                      <td>{incident.Owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

        </div>

        <div className='section'>
          <h2 className='section-title'>
            Delivery Due
            <p>Total: {srs.length}</p>
          </h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!error && (
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Subject</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {srs.map((sr) => (
                    <tr key={sr.RecId}>
                      <td><b>{sr.ServiceReqNumber}</b></td>
                      <td>{sr.Subject}</td>
                      <td>{sr.Owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>      
        
        <div className='section'>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!error && (
            <>
            <h2 className='section-title'>Next Available KR</h2>
            <h1 className="kpi-value">
              {latestCI}
            </h1>
            </>
          )}
        </div>
        <div className='section'>
          <h2 className='section-title'>
            P1 Incidents
          </h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!error && (
            <>
              <table className="incident-info">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Subject</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {activeinc.map((incident)=>{
                    if (incident.Priority == 1){
                      return (
                        <tr key={incident.RecId} style={{backgroundColor:"red"}}>
                          <td><b>{incident.IncidentNumber}</b></td>
                          <td>{incident.Subject}</td>
                          <td>{incident.Owner}</td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

      </div>
      </>
  );
}

export default App;
