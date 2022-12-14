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
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/authReducer';


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
  const [inputError, setInputError] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string>();
  const user = useSelector(selectUser);

  React.useEffect(() => {
    if (file?.name){
      setImageUrl(URL.createObjectURL(file));
    }
  }, [file, file?.name])

  React.useEffect(() => {
    const timeOutId = setTimeout(() => {
      console.log(inputValue);
        if (inputValue !== user.name){
          setInputError(true);
        }
        else {
          setInputError(false);
        }
      // const upload = await axios({
      //     url:"http://localhost:3000/checkNickname",
      //     method:"get",
      //     headers:{
      //         Authorization: `Bearer your token`
      //     },
      //     inputValue:
      // }).then(r => r);
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [inputValue, user?.name]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      nickname: data.get('nickname'),
      file: file
    });
    // const upload = await axios({
    //     url:"http://localhost:3000/upload",
    //     method:"post",
    //     headers:{
    //         Authorization: `Bearer your token`
    //     },
    //     data:
    // }).then(r => r);
  };

  const onFileChange = async (iFile: React.ChangeEvent) => {
      iFile.preventDefault();
      const target = iFile.target as HTMLInputElement;
      console.log(target.files);
      if (target.files && target.files.length !== 0) {
        setFile(target.files[0]);
        console.log(target.files);
      }
  }

  function nickChange (this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
    // console.log(inputValue);
  }

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
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
              <Grid item xs={6}>
                <Avatar
                  alt={user.name}
                  src={imageUrl || user.image}
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
                  autoComplete='nickname'
                  name="nickname"
                  defaultValue={user?.name || "nickname"}
                  fullWidth
                  id="nickname"
                  label="nickname"
                  autoFocus
                  error={inputError}
                  helperText={inputError? 'This nickname is taken' : ''}
                  onChange={nickChange}
                />
              </Grid>
              {/* <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox value="allowExtraEmails" color="primary" />}
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid> */}
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