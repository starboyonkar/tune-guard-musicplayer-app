
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AudioProvider } from "./lib/audioContext";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SoundEffectsInitializer from "./components/SoundEffectsInitializer";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <SoundEffectsInitializer />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
        <Toaster />
      </AudioProvider>
    </BrowserRouter>
  );
}

export default App;
