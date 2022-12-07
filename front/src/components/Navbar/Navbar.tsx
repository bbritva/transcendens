import { Authorization } from 'src/features/authorization/Authorization';
import ButtonVariant3 from "src/components/NavButton/ButtonVariant3";

function Navbar() {
  const propsData = {
    buttonVariant1: {
      contact: "Game",
    },
    buttonVariant2: {
      contact: "Stats",
    },
  };
    return (
        <div className="navbar-container">
          <div className="navbar">
            <div className="logo-text">PONG</div>
            <ButtonVariant3
              {...propsData.buttonVariant1}
            />
            <ButtonVariant3
              {...propsData.buttonVariant2}
            />
            <Authorization className="button-variant-3"/>
          </div>
        </div>
    );
}

export default Navbar;