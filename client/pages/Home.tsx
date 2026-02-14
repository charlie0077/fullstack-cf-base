import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.hello
      .$get()
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => setMessage(data.message))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div role="alert">Error: {error}</div>;

  return (
    <main>
      <h1>{message || "Loading..."}</h1>
    </main>
  );
}
