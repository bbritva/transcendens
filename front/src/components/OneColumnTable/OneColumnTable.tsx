import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useState, useEffect } from "react";


const OneColumnTable: FC<{
    name: string,
    loading: boolean,
    elements: [{name: string, model: string}],
    getName: boolean,
  }> = ({name, loading, elements, getName = true}): ReactElement => {
  const theme=useTheme();
  return (
    <TableContainer
        component={Paper}
        sx={{
          border: "4px solid rgba(0,0,0,0.2)",
          height: '30%',
          width: '100%',
          "&::-webkit-scrollbar": {
            width: 3
          },
          "&::-webkit-scrollbar-track": {
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.primary.light,
            borderRadius: 2
          },
          overflowX: "hidden"
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
          <TableBody>
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
          </TableBody>
        </Table>
      </TableContainer>
  );
}


export default OneColumnTable;
