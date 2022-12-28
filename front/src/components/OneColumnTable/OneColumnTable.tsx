import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, CSSProperties } from "react";
import { chatStylesI } from "src/pages/Chat/ChatPage";


const anchorStyle = {
  overflowAnchor:'auto',
  height:'1px'
};

const OneColumnTable: FC<{
    name: string,
    loading: boolean,
    elements: [{name: string, model: string}],
    getName: boolean,
    chatStyles: chatStylesI
  }> = ({name, loading, elements, getName = true, chatStyles}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  return (
    <TableContainer
        ref={tableRef}
        component={Paper}
        sx={{
          height: '99.3%',
          ...chatStyles.borderStyle,
          ...chatStyles.scrollStyle
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
