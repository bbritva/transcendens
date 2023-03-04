import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useStore } from "react-redux";
import { updateUser, userI } from "src/store/userSlice";
import userService from "src/services/user.service";
import { RootState } from "src/store/store";
import { Typography, useTheme } from "@mui/material";
import { useAppDispatch } from "src/app/hooks";
import StyledBox, { styledBoxI } from "../BasicTable/StyledBox";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import AccountButton from "./StyledButton";
import CloudSyncIcon from "@mui/icons-material/CloudSync";

export default function SignUp(props: styledBoxI) {
  const username = sessionStorage.getItem("username");
  const [file, setFile] = React.useState<any>();
  const [imageUrl, setImageUrl] = React.useState<any>();
  const [inputError, setInputError] = React.useState<boolean>(false);
  const [inputValue, setInputValue] = React.useState<string>(username || "");

  const [avatarSource, setAvatarSource] = React.useState<string>("");
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const dispatch = useAppDispatch();

  const theme = useTheme();

  React.useEffect(() => {
    if (file?.name) {
      setImageUrl(URL.createObjectURL(file));
    }
  }, [file, file?.name]);

  React.useEffect(() => {
    imageUrl
      ? setAvatarSource(imageUrl)
      : user.user?.avatar
      ? setAvatarSource(
          process.env.REACT_APP_USERS_URL + `/avatar/${user.user.avatar}`
        )
      : setAvatarSource(user.user?.image || "");
  }, [imageUrl, user.user?.avatar]);

  React.useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (inputValue !== user.user?.name) {
        setInputError(true);
      } else {
        setInputError(false);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [inputValue, user.user?.name]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    const res = (await userService.uploadAvatar(formData)) as userI;
    if (res?.avatar && user.user) {
      dispatch(updateUser({ ...user.user, avatar: res?.avatar }));
    }
    setFile(null);
    setImageUrl("");
  };

  const onFileChange = async (iFile: React.ChangeEvent) => {
    iFile.preventDefault();
    const target = iFile.target as HTMLInputElement;
    if (target.files && target.files.length !== 0) {
      setFile(target.files[0]);
    }
  };

  function nickChange(
    this: any,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
  }

  return (
    <StyledBox {...props}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container>
            <Box
              overflow="hidden"
              display={"flex"}
              maxHeight="20vh"
              maxWidth={"100%"}
              justifyContent="center"
            >
              <Box
                component={"img"}
                alt={user.user?.name}
                src={avatarSource}
                maxWidth="80%"
                sx={{
                  m: 1,
                  bgcolor: "secondary.main",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Grid
              item
              xs={11}
              display="flex"
              alignItems="flex-start"
              marginTop={3}
            >
              <AlternateEmailIcon
                fontSize="large"
                sx={{ color: theme.palette.primary.dark, mr: 1, my: 1.5 }}
              />
              <TextField
                variant="filled"
                name="nickname"
                fullWidth
                id="nickname"
                value={inputValue}
                autoFocus
                error={inputError}
                helperText={inputError ? "This nickname is taken" : ""}
                onChange={nickChange}
              />
            </Grid>
          </Grid>
          <AccountButton type="submit">
            <CloudSyncIcon fontSize="large" sx={{ mr: 1, my: 1.5 }} />
            Update
          </AccountButton>
        </Box>
      </Box>
    </StyledBox>
  );
}
