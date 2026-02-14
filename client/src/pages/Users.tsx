import { useState } from "react";
import { trpc } from "../lib/api";


export default function Users() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: users, isLoading, error, refetch } = trpc.users.list.useQuery();
  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      setName("");
      setEmail("");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({ name, email });
  };

  return (
    <main>
      <h1>Users</h1>

      <div className="card">
        <h2>Add User</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? "Creating..." : "Create User"}
          </button>
          {createUser.error && <p role="alert">Error: {createUser.error.message}</p>}
        </form>
      </div>

      <div className="card">
        <h2>User List</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p role="alert">Error: {error.message}</p>}
        {users && users.length === 0 && <p>No users yet. Add one above!</p>}
        {users && users.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #444" }}>Name</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #444" }}>Email</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #444" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #333" }}>{user.name}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #333" }}>{user.email}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #333" }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="read-the-docs">
        <a href="/">← Back to Home</a>
      </p>
    </main>
  );
}
