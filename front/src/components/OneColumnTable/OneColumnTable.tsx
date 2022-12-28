import { Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, CSSProperties } from "react";
import { chatStylesI } from "src/pages/Chat/ChatPage";


const anchorStyle = {
  overflowAnchor: 'auto',
  height: '1px'
};

const OneColumnTable: FC<{
  name: string,
  loading: boolean,
  elements: [{ name: string, model: string }],
  chatStyles: chatStylesI,
  selectedElement: {},
  setElement: ({ }) => void
}> = ({
  name,
  loading,
  elements,
  chatStyles,
  selectedElement,
  setElement
}): ReactElement => {
    const theme = useTheme();
    const tableRef = useRef(null);
    return (
      <Grid container
        component={Paper}
        sx={{
          display: "flex",
          justifyContent: "center",
          height: '100%',
          ...chatStyles.borderStyle,
        }}>
        <Typography variant="h6" maxHeight='3rem'
          sx={{
            ...chatStyles.textElipsis
          }}
        >
          {name}
        </Typography>
        <Grid
          ref={tableRef}
          sx={{
            height: '90%',
            ...chatStyles.scrollStyle
          }}>
          {
            loading
              ? 'LOADING'
              : elements.map((data) => {
                return (
                  <Button
                    key={data.name}
                    variant={selectedElement == data ? 'contained' : 'text'}
                    onClick={() => { setElement(data) }}
                    size='small'
                    sx={{
                      textAlign: 'left',
                      maxHeight: '2rem',
                      ...chatStyles.textElipsis
                    }}
                  >
                    {data.name}
                  </Button>
                )
              })
          }
          <div style={anchorStyle as CSSProperties} />
        </Grid>
      </Grid>
    );
  }


export default OneColumnTable;
