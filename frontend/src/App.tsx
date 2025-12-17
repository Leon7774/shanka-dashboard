import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddSale from "./pages/AddSale";
import Layout from "./components/Layout";
import DataTable from "./pages/DataTable";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-sale" element={<AddSale />} />
                    <Route path="/data-table" element={<DataTable />} />
                </Route>
            </Routes>
            <ThemeToggle />
        </Router>
    );
}

export default App;
