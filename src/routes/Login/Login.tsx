import { useContext, useState } from "react";
import Header from "../../components/header/Header";
import { useNavigate } from "react-router";
import AuthContext from "../../utils/contexts/sessions/AuthContext";
import MyError from "../../components/error/Error";

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!auth) {
    return (
      <MyError
        ErrorCode={1002}
        ErrorMessage="Auth context failed to initialise"
      />
    );
  }

  async function handleLogin() {
    setLoading(true);
    setError(null);

    try {
      const isEmail = identifier.includes("@");

      const endpoint = isEmail
        ? "http://localhost:9003/api/auth/login/email"
        : "http://localhost:9003/api/auth/login/username";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: isEmail ? identifier : undefined,
          username: !isEmail ? identifier : undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Invalid credentials");
      }

      // =========================
      // FETCH FULL USER (DB TRUTH)
      // =========================
      const userRes = await fetch(
        `http://localhost:9003/api/users/${data.user.uid}`,
      );

      const userData = await userRes.json();

      if (!userData.uid) {
        throw new Error("Failed to load user");
      }

      // =========================
      // AUTH STATE UPDATE (NEW MODEL)
      // =========================
      auth?.setUser(userData);
      auth?.setIsLoggedIn(true);

      console.log(auth?.isLoggedIn);
      console.log(auth?.user);

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 text-(--local-green-dark)">
          Login
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm border-4 border-(--local-green) flex flex-col gap-4">
          {/* IDENTIFIER */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-2xl">Email or Username</label>
            <input
              className="border rounded-xl w-full px-3 py-2"
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-2xl">Password</label>
            <input
              className="border rounded-xl w-full px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ERROR */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={!identifier || !password || loading}
            className="text-2xl font-bold text-white bg-(--local-green) py-3 px-6 rounded-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* SIGNUP LINK */}
        <a
          href="/signup"
          className="mt-4 text-(--local-green) font-bold hover:scale-105 transition-all"
        >
          Don't have an account? Sign up
        </a>
      </div>
    </div>
  );
}
