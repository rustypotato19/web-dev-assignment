import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./main.css";

import { BrowserRouter, Route, Routes } from "react-router";
import Landing from "./routes/landing/Landing";

import Login from "./routes/Login/Login";
import Signup from "./routes/Signup/Signup";

import Home from "./routes/home/Home";
import MyError from "./routes/error/Error";
import SessionContextProvider from "./utils/contexts/sessions/SessionContextProvider";
import Profile from "./routes/profile/Profile";
import About from "./routes/about/About";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <SessionContextProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile/**/*" element={<Profile />} />

          <Route path="about" element={<About />} />
          <Route path="about/:anchor" element={<About />} />

          <Route
            path="*"
            element={<MyError ErrorCode={404} ErrorMessage="Page not found" />}
          />
        </Routes>
      </SessionContextProvider>
    </StrictMode>
  </BrowserRouter>,
);
