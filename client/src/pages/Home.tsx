import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import { trpc } from "../lib/api";


export default function Home() {
  const [count, setCount] = useState(0);
  const { data, error, isLoading, refetch } = trpc.hello.useQuery(
    {},
    { enabled: false },
  );

  return (
    <main>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card">
        <button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? "Loading..." : "Fetch from API"}
        </button>
        {error && <p role="alert">Error: {error.message}</p>}
        {data && !error && <p>{data.message}</p>}
      </div>
      <div className="card">
        <a href="/users">Go to Users →</a>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </main>
  );
}
