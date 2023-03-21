import { PaletteMode } from "@mui/material";

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
                : '#a8a4a4',

      },
      info: {
        main: mode === 'light'
                ? '#8bd4d1'
                :'#c9c5c5',
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
                : '#a8a4a4',

        fontFamily:  'Arial',
        fontSize: 14,
        fontWeight: "bolder",
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
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            "&.Mui-disabled": {
              borderColor: mode === 'light'
              ?'#56a2b8'
              :'#2e3544',
            }
          }
        }
      }
    }
  });
  