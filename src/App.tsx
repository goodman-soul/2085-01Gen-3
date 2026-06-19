import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import DeviceDetail from "@/pages/DeviceDetail";
import Replenishment from "@/pages/Replenishment";
import Sales from "@/pages/Sales";
import Products from "@/pages/Products";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/replenishment" element={<Replenishment />} />
          <Route path="/replenishment/tasks" element={<Replenishment />} />
          <Route path="/replenishment/history" element={<Replenishment />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/anomalies" element={<Sales />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
