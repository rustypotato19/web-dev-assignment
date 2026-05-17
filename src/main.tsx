import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./main.css";

import { BrowserRouter, Route, Routes } from "react-router";
import Landing from "./routes/landing/Landing";

import Login from "./routes/Login/Login";
import Signup from "./routes/Signup/Signup";

import Home from "./routes/home/Home";
import MyError from "./components/error/Error";
import AuthContextProvider from "./utils/contexts/sessions/AuthContextProvider";
import Profile from "./routes/profile/Profile";
import About from "./routes/about/About";
import Lists from "./routes/Lists/Lists";
import List from "./routes/Lists/List/List";
import Settings from "./routes/settings/Settings";
import Logout from "./routes/logout/Logout";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/profile/:username?" element={<Profile />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/lists/:username?" element={<Lists />} />

          <Route path="/list/:listid" element={<List />} />

          <Route path="/logout" element={<Logout />} />

          <Route path="/about" element={<About />} />
          <Route path="/about/:anchor" element={<About />} />

          <Route
            path="*"
            element={<MyError ErrorCode={404} ErrorMessage="Page not found" />}
          />
        </Routes>
      </AuthContextProvider>
    </StrictMode>
  </BrowserRouter>,
);
