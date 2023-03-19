import { styled, Theme } from "@mui/material/styles";
import { Box, BoxProps } from "@mui/material";

const StyledBackground = styled(Box)<BoxProps>(
  ({ theme }: { theme: Theme }) => {
    return {
      color: theme.palette.secondary.main,
      backgroundColor: theme.palette.primary.main,
      width: "100%",
      height: "100%",
      backgroundPosition: "center",
      backgroundSize: "cover",
    };
  }
);

// Export the customized component
export default StyledBackground;
