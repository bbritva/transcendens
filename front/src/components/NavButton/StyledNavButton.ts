import { Button, ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

interface styledNavButtonProps extends ButtonProps {
  component: any;
  to: any;
}

export const StyledNavButton = styled(Button)<styledNavButtonProps>(
  ({ theme }) => ({
    fontSize: "large",
    marginLeft: "3rem",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
    },
    display: "flex",
    [theme.breakpoints.only("xs")]: { display: "none" },
  })
);
