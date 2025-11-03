import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // proxy server
  withCredentials: true,                // sends cookies like SID automatically
});
api.get("/Incidents")
export default api;
