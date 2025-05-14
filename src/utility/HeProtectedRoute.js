import { Navigate } from "react-router-dom";

export const HeProtectedRoute = ({ children }) => {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }
  return (
    <>
      <div className="d-flex">
        <div className="col-12">{children}</div>
      </div>
    </>
  );
};
