import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useStore } from 'react-redux';
import { updateUser, userI } from 'src/store/userSlice';
import userService from 'src/services/user.service';
import { RootState } from 'src/store/store';
import DialogSelect from 'src/components/DialogSelect/DialogSelect';
import { DialogContentText, DialogTitle } from '@mui/material';
import authService from 'src/services/auth.service';
import ChooseTwoFA, { twoFAdialogProps } from './ChooseTwoFA';
import { useAppDispatch } from "src/app/hooks";


function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function SignUp() {
  const [file, setFile] = React.useState<any>();
  const [imageUrl, setImageUrl] = React.useState<any>();
  const [urlQR, setUrlQR] = React.useState<any>();
  const [inputError, setInputError] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string>();
  const [otpValue, setOtpValue] = React.useState<string>('');
  const [avatarSource, setAvatarSource] = React.useState<string>('');
  const [open, setOpen] = React.useState<boolean>(false);
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const dispatch = useAppDispatch();
  const [otpError, setOtpError] = React.useState<boolean>(false);


  React.useEffect(() => {
    if (file?.name){
      setImageUrl(URL.createObjectURL(file));
    }
  }, [file, file?.name])

  React.useEffect(() => {
    imageUrl
    ? setAvatarSource(imageUrl)
    : user.user?.avatar
      ? setAvatarSource(process.env.REACT_APP_USERS_URL + `/avatar/${user.user.avatar}`)
      : setAvatarSource(user.user?.image || '')
  }, [imageUrl, user.user?.avatar])

  React.useEffect(() => {
    const timeOutId = setTimeout(() => {
        if (inputValue !== user.user?.name){
          setInputError(true);
        }
        else {
          setInputError(false);
        }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [inputValue, user.user?.name]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    const res = await userService.uploadAvatar(formData) as userI;
    if (res?.avatar && user.user){
      dispatch(updateUser({...user.user, avatar: res?.avatar}));
    }
    setFile(null);
    setImageUrl('');
  };

  const onFileChange = async (iFile: React.ChangeEvent) => {
      iFile.preventDefault();
      const target = iFile.target as HTMLInputElement;
      if (target.files && target.files.length !== 0) {
        setFile(target.files[0]);
      }
  }

  function nickChange (this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
  }

  async function generateTwoFA() {
    const src = await authService.otpGenerateQR();
    if (src){
      setUrlQR(src);
      setOpen(true);
    }
    else
      setOpen(false);
  }

  async function enableTwoFA() {
    setOtpError(false)
    const userEnable = await authService.otpTurnOn(otpValue);
    if (!userEnable?.isTwoFaEnabled){
      setOtpError(true);
      return;
    }
    setOpen(false);
    setTimeout(
      () => {dispatch(updateUser({...userEnable}));},
      140
    );
  }

  async function disableTwoFA() {
    setOtpError(false)
    const userDisable = await authService.otpTurnOff(otpValue);
    if (userDisable.isTwoFaEnabled){
      setOtpError(true);
      return;
    }
    setOpen(false);
    setTimeout(
      () => {dispatch(updateUser({...userDisable}))},
      140
    );
  }

  function onChange(this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setOtpValue(event.currentTarget.value);
  }

  const enableProps: twoFAdialogProps = {
    title: 'Enable', 
    urlQR: urlQR,
    isEnabled: true,
    onClick: enableTwoFA,
    onChange: onChange,
    value: otpValue,
    error: otpError
  }

  const disableProps: twoFAdialogProps = {
    title: 'Disable', 
    urlQR: urlQR,
    isEnabled: false,
    onClick: disableTwoFA,
    onChange: onChange,
    value: otpValue,
    error: otpError
  }

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <DialogSelect options open={open} setOpen={setOpen}>
        <ChooseTwoFA {
                ...(user.user?.isTwoFaEnabled
                ? disableProps
                : enableProps)
          }/>
        </DialogSelect>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Update your account
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
              {
                user.user?.isTwoFaEnabled
                ?
                <Button variant="contained" component="label" onClick={() => {setOpen(true)}}>
                  Disable two factor auth
                </Button>
                :
                <Button variant="contained" component="label" onClick={generateTwoFA}>
                  Enable two factor auth
                </Button>
              }
              </Grid>
              <Grid item xs={6}>
                <Avatar
                  alt={user.user?.name}
                  src={avatarSource}
                  sx={{
                    width: 100,
                    height: 100,
                    m: 1,
                    bgcolor: 'secondary.main'
                  }}
                />
              </Grid>
              <Grid item xs={6} display={'flex'} alignItems={'center'}>
                <Button variant="contained" component="label">
                  Upload photo
                  <input 
                    hidden id="uploaded-photo" 
                    accept="image/*" 
                    multiple type="file" 
                    onChange={onFileChange}/>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="nickname"
                  fullWidth
                  id="nickname"
                  label="nickname"
                  autoFocus
                  error={inputError}
                  helperText={inputError? 'This nickname is taken' : ''}
                  onChange={nickChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update
            </Button>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
  );
}