import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton, Paper, Typography, useTheme } from "@mui/material";
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
  myRef?: ForwardedRef<HTMLDivElement>;
}

function drawHeader(element: string) {
  return (
    <TableCell padding="checkbox" key={element}>
      <Typography variant="subtitle1">{element}</Typography>
    </TableCell>
  );
}

function drawRow(row: rowI) {
  const keys = Object.keys(row);
  return (
    <TableRow key={row.id}>
      {keys.map(
        (cellData, index) =>
          cellData !== "id" && (
            <TableCell  key={row.id + String(index)}>
              <Typography variant="body1">
                {
                  //@ts-ignore
                  row[cellData]
                }
              </Typography>
            </TableCell>
          )
      )}
    </TableRow>
  );
}

export default function BasicTable(props: basicTableI) {
  const theme = useTheme();
  const { tableHeadArray, tableRowArray, ...styledProps } = props;
  return (
    <StyledBox {...styledProps} ref={props.myRef}>
      {props.onClose && (
        <IconButton
          aria-label="close"
          onClick={() => {
            props.onClose && props.onClose();
          }}
          sx={{
            position: "absolute",
            right: "2px",
            top: "1px",
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      {props.title && (
        <Typography
          variant="body1"
          id="tableTitle"
          component="div"
          padding="0.25rem"
          marginLeft="2.5rem"
        >
          {props.title}
        </Typography>
      )}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: theme.palette.secondary.main,
          margin: "auto",
          maxHeight: "27.5vh",
          overflow: "scroll",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          [theme.breakpoints.down("md")]: {
            overflowY: "scroll",
          },
        }}
      >
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
