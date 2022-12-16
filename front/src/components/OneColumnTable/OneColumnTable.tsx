import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ReactElement, FC, useState, useEffect } from "react";


const OneColumnTable: FC<{
    name: string,
    loading: boolean,
    elements: [{name: string, model: string}],
    getName: boolean,
  }> = ({name, loading, elements, getName = true}): ReactElement => {
  return (
    <Table>
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
                      : data.model
                    }
                  </TableCell>
                </TableRow>);
            })
        }
      </TableBody>
    </Table>
  );
}


export default OneColumnTable;
