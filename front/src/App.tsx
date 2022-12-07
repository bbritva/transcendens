import "src/App.css";
import exclude from "src/assets/exclude.svg";
import ButtonVariant3 from "src/components/NavButton/ButtonVariant3";
import Navbar from 'src/components/Navbar/Navbar';

function App() {
  const propsData = {
    buttonVariant33: {
      contact: "Most Popular",
    },
  };
  return (
    <div className="landing-background">
      <div className="main-container">
        <Navbar />
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
