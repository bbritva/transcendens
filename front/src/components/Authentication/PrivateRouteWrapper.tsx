import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectLoggedIn } from "src/store/authReducer";


const PrivateRouteWrapper = ({ children }: { children: JSX.Element }) => {
  const testUsername = sessionStorage.getItem('username');
  const isLoggedIn = useSelector(selectLoggedIn);
  return testUsername || isLoggedIn || children.type.name === "HomePage" ? children : <Navigate to="/" replace={true} />;
};

export default PrivateRouteWrapper;