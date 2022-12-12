import "src/App.css";
import Navbar from 'src/components/Navbar/Navbar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { Grid } from "@mui/material";

function App() {
  return (
    <div className="landing-background">
        <Router>
          <Grid container spacing={2} justifyContent="center">
              <Navbar />
            <Allerts />
            <Grid item xs={8}>
              <Routes>
                {appRoutes.map((route) => (
                    <Route
                      key={route.key}
                      path={route.path}
                      element={<route.component />}
                    />
                  ))}
              </Routes>
            </Grid>
          </Grid>
        </Router>
     </div>
  );
};

export default App;
