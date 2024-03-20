import React from "react";
import "./app.css";
import Header from "./components/header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import * as useHooks from "@uidotdev/usehooks";
// import SignupPage from "./pages/signup";
import Contact from "./pages/contact";
import WebFont from "webfontloader";

WebFont.load({
    google: {
        families: [
            "Montserrat:100,200,300,400,500,600,700,800,900",
            "Roboto:100,200,300,400,500,600,700,800,900"
        ]
    }
});

/**
 * @type {{
 *  data?: any;
 *  set?: any;
 * }}
 */
export var states = {};

function App() {
    const [state, setState] = useHooks.useObjectState({});
    states = {
        data: state,
        set: setState
    };

    React.useEffect(() => {
        (async () => {
            const response = await fetch('/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.data?.username) {
                    setState({
                        user: data?.data
                    });
                }
            } else {
                console.error('Failed to retrieve user data');
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <div className="App">
                <Header />
                <div style={{ padding: "16px", marginTop: "3.75rem", marginBottom: "3.75rem" }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/contact" element={<Contact />} />
                        {/* <Route path="/signup" element={<SignupPage />} /> */}
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
