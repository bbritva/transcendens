import exclude from "src/assets/exclude.svg";
import ButtonVariant3 from "src/components/NavButton/ButtonVariant3";

function HomePage() {
  const propsData = {
    buttonVariant33: {
      contact: "Most Popular",
    },
  };
  return (
    <>
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
    </>
  );
}

export default HomePage;