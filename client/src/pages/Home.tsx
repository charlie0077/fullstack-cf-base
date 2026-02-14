import { useState } from "react";
import { Link } from "react-router";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import { trpc } from "../lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [count, setCount] = useState(0);
  const { data, error, isLoading, refetch } = trpc.hello.useQuery(
    {},
    { enabled: false },
  );

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 p-8">
      <div className="flex gap-8">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="h-24 transition-all hover:drop-shadow-[0_0_2em_#646cffaa]" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="h-24 animate-spin transition-all [animation-duration:20s] hover:drop-shadow-[0_0_2em_#61dafbaa]" alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold">Vite + React</h1>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Counter</CardTitle>
          <CardDescription>
            Edit <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">src/App.tsx</code> and save to test HMR
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => setCount((c) => c + 1)}>
            count is {count}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>API</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Fetch from API"}
          </Button>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>Error: {error.message}</AlertDescription>
            </Alert>
          )}
          {data && !error && (
            <p className="text-muted-foreground">{data.message}</p>
          )}
        </CardContent>
      </Card>

      <Button variant="link" asChild>
        <Link to="/users">Go to Users &rarr;</Link>
      </Button>

      <p className="text-sm text-muted-foreground">
        Click on the Vite and React logos to learn more
      </p>
    </main>
  );
}
