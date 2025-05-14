import {
  BrowserRouter,
  Route,
  Router,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./login/Login";
import Home from "./home/Home";
import { HeProtectedRoute } from "./utility/HeProtectedRoute";
import { ToastContainer } from "react-toastify";
import CafeLog from "./log/cafeLog";
import Kisok from "./kiosk/Kiosk";
import ProductsTable from "./products/ProductsTable";
import Inventory from "./products/inventory";
import AttendanceApp from "./HR/AttendanceApp";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/kiosk" exact element={<Kisok />} />
          <Route path="/products" exact element={<ProductsTable />} />
          <Route path="/inventory" exact element={<Inventory />} />
          <Route path="/" exact element={<AttendanceApp />} />
          {/* <Route
            path="*"
            exact
            element={
              <HeProtectedRoute>
                <Navigate to="/" />
              </HeProtectedRoute>
            }
          /> */}
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="bottom-left"
        autoClose={1000}
        rtl={true}
        theme="dark"
      />
    </>
  );
}
