import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box } from "@mui/system";
import { Typography } from "@mui/material";

export interface rowI {
  id: number;
}

export interface matchHistoryRowI extends rowI {
  score: string;
  result: string;
  rival: string;
}

export interface playerStatisticsRowI extends rowI {
  data: string;
  rank: string;
}

export interface settingsRowI extends rowI {
  button: string;
}

export interface basicTableI {
  title: string;
  tableHeadArray: string[] | null;
  tableRowArray: rowI[];
}

function drawHeader(element: string) {
  return <TableCell key={element}> {element} </TableCell>;
}
function drawRow(row: rowI) {
  const keys = Object.keys(row);
  return (
    <TableRow
      key={row.id}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      {keys.map(
        (cellData) =>
          //@ts-ignore
          cellData !== "id" && <TableCell>{row[cellData]}</TableCell>
      )}
    </TableRow>
  );
}

export default function BasicTable(props: basicTableI) {
  return (
    <Box>
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {props.title}
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          {props.tableHeadArray && (
            <TableHead>
              <TableRow>{props.tableHeadArray.map(drawHeader)}</TableRow>
            </TableHead>
          )}
          <TableBody>{props.tableRowArray.map(drawRow)}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}