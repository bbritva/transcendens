import React, { ReactElement, FC, useState, useEffect } from "react";
import { Box, Container, CssBaseline, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import userService from "src/services/user.service";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable from "src/components/OneColumnTable/ChatTable";

const ChatPage: FC<any> = (): ReactElement => {
  const [users, setUsers] = useState<[{name: string, model: string}]>([{name: '', model: ''}]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    userService.getUsers()
      .then(res => {
        setUsers(res.data.results);
        setLoading(false);
      })
      .catch(err => console.log(err));
  }, [loading]
  );
  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
        <Grid container spacing={2}
          display={'flex'}
          flex-direction={'row'}
          align-items={'center'}
        >
          <Grid item xs={2}>
            <OneColumnTable
              name={'Channels'}
              loading={loading}
              elements={users}
              getName={false}
            />
          </Grid>
          <Grid item xs={2}>
            <OneColumnTable
              name={'Users'}
              loading={loading}
              elements={users}
              getName={true}
            />
          </Grid>
          <Grid item xs={8}>
            <ChatTable
              name={'Chat'}
              loading={loading}
              elements={users}
              getName={false}
            />
          </Grid>
        </Grid>
    </Box>
  );
};

export default ChatPage;