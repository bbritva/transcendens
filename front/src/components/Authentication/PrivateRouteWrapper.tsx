import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectLoggedIn } from "src/store/authReducer";


const PrivateRouteWrapper = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = useSelector(selectLoggedIn);
  return isLoggedIn || children.type.name === "HomePage" ? children : <Navigate to="/" replace />;
};

export default PrivateRouteWrapper;