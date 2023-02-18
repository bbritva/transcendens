import { styled, Theme } from "@mui/material/styles";
import BasicTable, { basicTableI } from "./BasicTable";

// Define the interface for the component's props
// Add any additional props you want to use

// Define the component using the props interface
export interface styledTableI extends basicTableI {
  myBackColor: string;
}

// Use the styled function to create a customized version of the component
const StyledTable = styled(BasicTable)<styledTableI>(
  ({ theme, myBackColor }: { theme: Theme; myBackColor?: string }) => {
    return {
      borderRadius: 20,
      boxShadow: "0 3px 5px 2px rgba(0, 1, 1, .3)",
      padding: "2rem",
      margin: "1rem 3rem 0 0",
    };
  }
);

// Export the customized component
export default StyledTable;
