import { useEffect, useState } from "react";

// main UI component
function App() {
  const [message, setMessage] = useState("");

  // fetch from backend
  useEffect(() => {
    fetch("http://localhost:5000/helloWorld") // we don't need to specify the full URL since the proxy is set in package.json
    .then(res => res.json())
    .then(data => setMessage(data.message));
  }, []);

  return(
    <div>
      <h1>Message from backend:</h1>
      <p>{message}</p>
    </div>
  )
}

export default App;
