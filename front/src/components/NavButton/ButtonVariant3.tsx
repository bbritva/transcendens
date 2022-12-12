const ButtonVariant3 = (props: { contact: string, className?: string }) => {
  return (
    <div className={`button-variant-3 ${props.className || ""}`}>
      <span className="contact">{props.contact || "Trips"}</span>
    </div>
  );
};
export default ButtonVariant3;
