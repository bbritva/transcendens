import { Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { Route } from "src/routes";
import { StyledNavButton } from "./StyledNavButton";

interface navButtonProps {
  page: Route;
  children: React.ReactNode | React.ReactNode[];
}

function NavButton({ children, page }: navButtonProps) {
  return (
    <StyledNavButton
      key={page.key}
      component={NavLink}
      to={page.path}
      variant={"text"}
    >
      <Typography color="secondary">{children}</Typography>
    </StyledNavButton>
  );
}

export default NavButton;
