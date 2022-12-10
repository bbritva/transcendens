import "src/App.css";
import Navbar from 'src/components/Navbar/Navbar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes as appRoutes } from "src/routes";

function App() {
  return (
    <div className="landing-background">
      <div className="main-container">
        <Router>
          <Navbar />
          <Routes>
            {appRoutes.map((route) => (
                <Route
                  key={route.key}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
          </Routes>
        </Router>
      </div>
     </div>
  );
};

export default App;
