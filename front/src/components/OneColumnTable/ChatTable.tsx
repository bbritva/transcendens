import { IconButton, InputAdornment, OutlinedInput, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useState, useRef } from "react";


const ChatTable: FC<{
  name: string,
  loading: boolean,
  elements: [{ name: string, model: string }],
  getName: boolean,
}> = ({ name, loading, elements, getName = true }): ReactElement => {
  const [value, setValue] = useState('');
  const theme = useTheme();
  const tableRef = useRef(null);
  const scroll = tableRef?.current;
  if (scroll && !loading) {
    // @ts-ignore
    scroll.scrollTop = scroll.scrollHeight;
  }
  const onSubmit = () => {
    // socket.emit('newMessage', value);
    console.log('newMessage', value);
    setValue('');
  };
  return (
    <TableContainer
      ref={tableRef}
      component={Paper}
      sx={{
        border: "4px solid rgba(0,0,0,0.2)",
        height: '40vh',
        // width: '1',
        "&::-webkit-scrollbar": {
          width: 3
        },
        "&::-webkit-scrollbar-track": {
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.primary.light,
          borderRadius: 2
        },
        overflow: 'scroll',
        overflowAnchor: 'none',
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Table>
        <TableHead>{name}</TableHead>
        <TableBody
          sx={{
            height: "100.001vh",
            display: "-ms-inline-grid",
          }}
        >
          {
            loading
              ? 'LOADING'
              : elements.map((data) => {
                return (
                  <TableRow
                    sx={{
                    }}
                  >
                    <TableCell
                      component={'th'}
                      scope="row"
                      sx={{
                      }}
                    >
                      {
                        getName
                          ? data.name
                          : data.name == 'Chat'
                            ? data.name + ' was created by ' + data.model
                            : data.model
                      }
                    </TableCell>
                  </TableRow>);
              })
          }
          <OutlinedInput
            id="outlined-adornment-enter"
            onChange={(e) => setValue(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter')
                onSubmit();
            }}
            value={value}
            type={'text'}
            multiline
            fullWidth
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={onSubmit}
                  edge="end"
                >
                  Enter
                </IconButton>
              </InputAdornment>
            }
            label="input"
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
// const myStyle = { overflow-anchor:'auto', height='1px'};


export default ChatTable;
