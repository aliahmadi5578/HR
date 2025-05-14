import { Route, Routes, HashRouter } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import AttendanceApp from "./HR/AttendanceApp";

export default function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="" exact element={<AttendanceApp />} />
        </Routes>
      </HashRouter>
      <ToastContainer
        position="bottom-left"
        autoClose={1000}
        rtl={true}
        theme="dark"
      />
    </>
  );
}
