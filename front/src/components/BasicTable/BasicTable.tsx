import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton, Typography } from "@mui/material";
import StyledBox, { styledBoxI } from "./StyledBox";
import { ForwardedRef, ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";

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
  button: ReactNode;
}

export interface basicTableI extends styledBoxI {
  title: string;
  tableHeadArray: string[] | null;
  tableRowArray: rowI[];
  onClose?: Function;
  myRef?: ForwardedRef<HTMLDivElement>
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
        (cellData, index) =>
          //@ts-ignore
          cellData !== "id" && (<TableCell key={row.id + String(index)}>{row[cellData]}</TableCell>)
      )}
    </TableRow>
  );
}

export default function BasicTable(props: basicTableI) {
  const { tableHeadArray, tableRowArray, ...styledProps } = props;
  return (
    <StyledBox {...styledProps} ref={props.myRef}>
      {props.onClose && (
        <IconButton
          aria-label="close"
          onClick={() => props.onClose && props.onClose()}
          sx={{
            alignSelf: "end",
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      {props.title && (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {props.title}
        </Typography>
      )}
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
