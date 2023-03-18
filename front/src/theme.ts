import { PaletteMode } from "@mui/material";
import { amber, deepOrange, grey } from "@mui/material/colors";

export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
      mode,
      primary: {
        main: mode === 'light'
                ?'#56a2b8' //blue dark
                :'#2e3544',
      },
      secondary: {
        main: mode === 'light'
                ?'#ecebd9' //bezhevyi
                :'#f8ece6',
      },
      info: {
        main: mode === 'light'
                ? '#8bd4d1'
                : '#aba8a6',
      },
    },
    typography: {
      body1: {
        color: mode === 'light'
                ? '#3c7180' // dark blue dark
                : '#2e3544',
        fontFamily:  'Arial',
        fontSize: 16,
        fontWeight: 'bolder',
        
      },
      subtitle1: {
        color: mode === 'light'
                ?'#56a2b8'
                :'#2e3544',
        fontFamily:  'Arial',
        fontSize: 15,
        fontWeight: "bolder",
      },
      subtitle2: {
        color: mode === 'light'
                ?'#ebebda'
                :'#f8ece6',
        fontFamily:  'Arial',
        fontSize: 14,
        fontWeight: "bolder",
        fontStyle: 'oblique',
      },
      h6: {
        color: mode === 'light'
                ?'#56a2b8'
                :'#2e3544',
        fontFamily:  'Arial',
        fontSize: 14,
        fontWeight: "bolder",
        fontStyle: 'oblique',
      },
    },
  });