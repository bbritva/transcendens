import "./App.css";
import exclude from "./assets/exclude.svg";
import rectangle22 from "./assets/rectangle22.svg";
import ButtonVariant3 from "./components/NavButton/ButtonVariant3";
import { Authorization } from './features/authorization/Authorization';

function App() {
  const propsData = {
    buttonVariant33: {
      contact: "Most Popular",
    },
  };
  return (
    <div className="landing-background">
      <div className="main-container">
        <div className="navbar-container">
          <div className="navbar">
            <div className="logo-text">PONG</div>
            <ButtonVariant3
              {...propsData.buttonVariant33}
            />
            <Authorization className="button-variant-3"/>
          </div>
        </div>
        <div className="text-container">
          <span className="text-up-header">
            Ultimate 42
          </span>
          <span className="text-down-header">peer pong</span>
        </div>
        <div className="down-buttons-container">
          <img className="exclude" src={exclude} />
          <ButtonVariant3
            {...propsData.buttonVariant33}
          />
        </div>
      </div>
     </div>
  );
};

export default App;
