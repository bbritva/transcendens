import { ScoreOutlined } from "@mui/icons-material";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useState, useEffect, useReducer, useRef } from "react";



const ChatTable: FC<{
    name: string,
    loading: boolean,
    elements: [{name: string, model: string}],
    getName: boolean,
  }> = ({name, loading, elements, getName = true}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  const scroll = tableRef?.current;
  console.log(scroll)
  if (scroll && !loading) {
      // @ts-ignore
    scroll.scrollTop = scroll.scrollHeight;
  }
  return (
    <TableContainer
        ref={tableRef}
        component={Paper}
        sx={{
          border: "4px solid rgba(0,0,0,0.2)",
          height: '40vh',
          width: '1',
          "&::-webkit-scrollbar": {
            width: 3
          },
          "&::-webkit-scrollbar-track": {
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.light,
            borderRadius: 2
          },
          // overflow: 'scroll',
          overflowAnchor: 'none',
          overflowX: "hidden",
          position: "relative"
        }}
      >
        <Table
          sx={{
            tableLayout: "auto",
            width: "max-content"
            //height: "max-content"
          }}
        >
          <TableHead>{name}</TableHead>
          <TableBody
        sx={{
          height: "100.001vh",
          overflow: 'scroll',
          overflowAnchor: 'none',
          overflowX: "hidden",
          position: "relative"
        }}
            // sx={{
            //   display: 'flex',
            //   flexDirection: "column-reverse",
            // }}
          >
            {
              loading
                ? 'LOADING'
                : elements.map((data) => {
                  return (
                    <TableRow>
                      <TableCell>
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
            <div style={{overflowAnchor: 'auto', height: '1px'}}></div>
          </TableBody>
        </Table>
      </TableContainer>
  );
}
// const myStyle = { overflow-anchor:'auto', height='1px'};


export default ChatTable;
