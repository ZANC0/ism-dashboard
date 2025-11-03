import axios from "axios";
import { useState } from "react";

function LogIn() {
  const [sid, setSid] = useState("");
  const [error, setError] = useState("");

  const sendSID = () => {
    localStorage.setItem("SID",sid)
  }

  return (
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
  );
}

export default LogIn;
