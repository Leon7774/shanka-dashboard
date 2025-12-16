import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddSale from "./pages/AddSale";
import Layout from "./components/Layout";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-sale" element={<AddSale />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
