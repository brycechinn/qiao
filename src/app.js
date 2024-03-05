import React from "react";
import "./app.css";
import Header from "./components/header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Header />
                <div style={{ padding: "16px", marginTop: "3.75rem", marginBottom: "3.75rem" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
