import { Button, ButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

interface styledNavButtonProps extends ButtonProps {
  component?: any ;
  to?: any;
  children: React.ReactNode | React.ReactNode[];
  onClick?: React.MouseEventHandler,
  showonxs?: boolean
}

export const StyledNavButton = styled(Button)<styledNavButtonProps>(
  ({ theme, showonxs }) => ({
    fontSize: "large",
    marginLeft: "3rem",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
    },
    display: "flex",
    [theme.breakpoints.only("xs")]: {
      display: showonxs
      ? ""
      : "none"
    },
  })
);

export const StyledMenuButton = styled(StyledNavButton)<styledNavButtonProps>(
  ({ theme, showonxs }) => ({
    marginLeft: "0rem",
    justifyContent: 'flex-start'
  })
);