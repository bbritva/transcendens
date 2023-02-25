import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Typography } from "@mui/material";
import StyledBox, { styledBox } from "./StyledBox";

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

export interface basicTableI extends styledBox {
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
          cellData !== "id" && <TableCell key={row.id + cellData}>{row[cellData]}</TableCell>
      )}
    </TableRow>
  );
}

export default function BasicTable(props: basicTableI) {
  const {tableHeadArray, tableRowArray, ...styledProps} = props;
  return (
    <StyledBox
      {...styledProps}
    >
      {props.title &&
        <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {props.title}
      </Typography>
      }
      <TableContainer>
        <Table aria-label="simple table">
          {props.tableHeadArray && (
            <TableHead>
              <TableRow>{props.tableHeadArray.map(drawHeader)}</TableRow>
            </TableHead>
          )}
          <TableBody>{props.tableRowArray.map(drawRow)}</TableBody>
        </Table>
      </TableContainer>
    </StyledBox>
  );
}
