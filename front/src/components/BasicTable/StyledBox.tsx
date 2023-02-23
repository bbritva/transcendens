import { styled, Theme } from "@mui/material/styles";
import BasicTable, { basicTableI } from "./BasicTable";
import { Box, BoxProps } from "@mui/material";

// Define the interface for the component's props
// Add any additional props you want to use

// Define the component using the props interface
export interface styledBox extends BoxProps {
  myBackColor?: string;
  myAlign?: string;
}

// Use the styled function to create a customized version of the component
const StyledBox = styled(Box)<styledBox>(
  ({ theme, myBackColor, myAlign }: { theme: Theme; myBackColor?: string; myAlign?: string }) => {
    return {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      borderRadius: 20,
      boxShadow: "0 3px 5px 2px rgba(0, 1, 1, .3)",
      padding: "2rem",
      margin: "2rem",
      width: '25vw',
      backgroundColor: myBackColor,
      alignSelf: myAlign,
      [theme.breakpoints.down("lg")]: { width: "55vw"},
    };
  }
);

// Export the customized component
export default StyledBox;
