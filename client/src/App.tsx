import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Users from "./pages/Users";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users" element={<Users />} />
    </Routes>
  );
}
