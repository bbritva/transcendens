import { styled, Theme } from "@mui/material/styles";
import BasicTable, { basicTableI } from "./BasicTable";
import { Box, BoxProps } from "@mui/material";

// Define the interface for the component's props
// Add any additional props you want to use

// Define the component using the props interface
export interface styledBoxI extends BoxProps {
  mybackcolor?: string;
  myalign?: string;
}

// Use the styled function to create a customized version of the component
const StyledBox = styled(Box)<styledBoxI>(
  ({ theme, mybackcolor, myalign }: { theme: Theme; mybackcolor?: string; myalign?: string }) => {
    return {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      borderRadius: 20,
      boxShadow: "0 3px 5px 2px rgba(0, 1, 1, .3)",
      padding: "1rem",
      margin: "1rem",
      width: '25vw',
      backgroundColor: mybackcolor,
      alignSelf: myalign,
      [theme.breakpoints.down("lg")]: { width: "55vw", maxHeight: '100vh'},
    };
  }
);

// Export the customized component
export default StyledBox;