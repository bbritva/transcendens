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
    <div className="landing-page-walking">
      <div className="rectangle-20">
        <div className="flex-container">
          {/* <img className="rectangle-22" src={rectangle22} /> */}
          <div className="rectangle-21">
            <div className="rugid-trips">PONG</div>
            {/* <ButtonVariant3
              className="button-variant-31-instance"
              {...propsData.buttonVariant31}
            /> */}
            <Authorization className="button-variant-31-instance"/>
          </div>
        </div>
        <div className="flex-container-1">
          <span className="uk-hiking-walking-t">
            Ultimate 42 &amp; PING_PONG
          </span>
          <span className="for-the-adventurer">FOR THE peers</span>
        </div>
        <div className="flex-container-2">
          <img className="exclude" src={exclude} />
          <ButtonVariant3
            className="button-variant-33-instance"
            {...propsData.buttonVariant33}
          />
        </div>
      </div>
     </div>
  );
};

export default App;
