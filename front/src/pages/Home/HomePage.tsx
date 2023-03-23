import { Box, Typography, useTheme } from '@mui/material'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DialogSelect from 'src/components/DialogSelect/DialogSelect';
import { selectLoggedIn } from 'src/store/authReducer';

function HomePage() {
  const theme = useTheme();
  const [loginText, setLoginText] = useState<string>('Login?');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const isLogged = useSelector(selectLoggedIn);

  useEffect(() => {
    let counter = sessionStorage.getItem('counter');
    if (!counter){
      counter = '1';
    } else {
      if (counter.length > 1)
        setLoginText("Login? Yes Login..... you know fish chips,  cup a tea .. bad food, worse weather ....Mary f%€king Poppins .... \nLogin ... ");
      counter += '1';
    }
    if (!isLogged)
      setTimeout(() => {setOpenDialog(true)}, 1200);
    else
      counter = '1'
    sessionStorage.setItem('counter', counter);
  }, [isLogged]);

  return (
    <Box
      marginTop={'15vh'}
      marginRight={'35vw'}
      display={'table-column'}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'center'
      }}>
      <Typography variant="h4" color={'lightsalmon'}>
        Ultimate 42
      </Typography>
      <Typography variant="h2" color={theme.palette.secondary.main}>
        Pong game
      </Typography>
      <DialogSelect
        options={{}}
        open={openDialog}
        setOpen={setOpenDialog}
      >        <Box
          margin={"1rem"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
        <Typography variant="body1" maxWidth={"300px"}>
          {loginText}
        </Typography>
        </Box>
      </DialogSelect>
    </Box>

  );
}

export default HomePage;