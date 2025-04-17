import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = localStorage.getItem("authToken");
  return !token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;
