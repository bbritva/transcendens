import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, CSSProperties } from "react";


const anchorStyle = {
  overflowAnchor:'auto',
  height:'1px'
};

const OneColumnTable: FC<{
    name: string,
    loading: boolean,
    elements: [{name: string, model: string}],
    getName: boolean,
  }> = ({name, loading, elements, getName = true}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  const scroll = tableRef?.current;
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
          overflowAnchor: 'none',
          overflowX: "hidden",
          position: "relative"
        }}
      >
        <Table
          sx={{
            tableLayout: "auto",
            width: "max-content"
          }}
        >
          <TableHead>{name}</TableHead>
          <TableBody
          >
            {
              loading
                ? 'LOADING'
                : elements.map((data) => {
                  return (
                    <TableRow
                      key={crypto.randomUUID()}
                    >
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
            <div style={anchorStyle as CSSProperties}></div>
          </TableBody>
        </Table>
      </TableContainer>
  );
}


export default OneColumnTable;
