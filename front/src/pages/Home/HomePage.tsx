import { Box, Typography, useTheme } from '@mui/material'
import { FC, ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DialogSelect from 'src/components/DialogSelect/DialogSelect';
import { selectLoggedIn } from 'src/store/authReducer';

const HomePage: FC<{twoFaOpen: boolean}> = ({twoFaOpen}): ReactElement => {
  const theme = useTheme();
  const [loginText, setLoginText] = useState<string>('Login?');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const isLogged = useSelector(selectLoggedIn);

    const later = (delay: number, value: string) => {
      let timer: NodeJS.Timeout | null;
      timer = null;
      let reject = null as any;
      const promise = new Promise((resolve, _reject) => {
        reject = _reject;
        timer = setTimeout(resolve, delay, value);
      });
      return {
        get promise() { return promise; },
        cancel() {
          if (timer) {
            clearTimeout(timer);
            timer = null;
            reject();
            reject = null;
          }
        }
      };
    };

  const l1 = later(1300, "l1");

  useEffect(() => {
    if (twoFaOpen)
      return;
    if (isLogged || twoFaOpen)
      l1.cancel();
    l1.promise
      .then(msg => {
        let counter = sessionStorage.getItem('counter');
        let code = sessionStorage.getItem('refreshToken');
        if (!counter) {
          counter = '1';
        } else {
          if (counter.length > 1)
            setLoginText("Login? Yes Login..... you know fish and chips,  cup of tea .. bad food, worse weather ....Mary f%€king Poppins .... \nLogin ... ");
          counter += '1';
        }
        if (!code && !twoFaOpen)
          setOpenDialog(true)
        else {
          setOpenDialog(false);
          counter = '1'
        }
        sessionStorage.setItem('counter', counter);
      })
      .catch(() => {});
    return () => l1.cancel();
  }, [isLogged,twoFaOpen]);


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
      { isLogged ? <></> : <DialogSelect
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
      }
    </Box>

  );
}

export default HomePage;