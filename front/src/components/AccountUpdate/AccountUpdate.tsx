import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useStore } from "react-redux";
import { updateUser, userI } from "src/store/userSlice";
import userService from "src/services/user.service";
import { RootState } from "src/store/store";
import { useTheme } from "@mui/material";
import { useAppDispatch } from "src/app/hooks";
import StyledBox, { styledBoxI } from "../BasicTable/StyledBox";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import AccountButton from "./StyledButton";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import socket from "src/services/socket";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import { fromBackI } from "src/pages/Chat/ChatPage";
import { UserInfoPublic } from "src/store/chatSlice";

export interface AccountUpdateProps extends styledBoxI {
  extUser: UserInfoPublic | boolean
}

export default function SignUp(props: AccountUpdateProps) {
  const username = sessionStorage.getItem("username");
  const [file, setFile] = React.useState<any>();
  const [imageUrl, setImageUrl] = React.useState<any>();
  const [inputError, setInputError] = React.useState<boolean>(false);
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const [inputValue, setInputValue] = React.useState<string>(username || user.user?.name || "");
  const [avatarSource, setAvatarSource] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const { extUser, ...styledProps} = props;

  const theme = useTheme();

  if (socket.connected){
    socket.on("nameAvailable",(data: fromBackI) => {
      setInputError(false);
    })
    socket.on("nameTaken",(data: fromBackI) => {
      setInputError(true);
    })
  }

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


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    const res = await userService.uploadAvatar(formData);
    if (res.data?.avatar && user.user){
      dispatch(updateUser({...user.user, avatar:  res.data.avatar}));
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
    const val = event.currentTarget.value
    setInputValue(val);
    const timeOutId = setTimeout(() => {
      if (val !== user.user?.name) {
        socket.emit("checkNamePossibility", {targetUserName: val})
      }
    }, 800);
  }

  function nickSearch (this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
    socket.emit("getNamesSuggestions", {targetUserName : event.currentTarget.value})
  }

  return (
    <StyledBox {...styledProps}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container>
            <Box
              overflow="hidden"
              display={"flex"}
              maxHeight="30vh"
              justifyContent="center"
              sx={{
                position: "sticky",
              }}
            >
              <Box
                component={"img"}
                alt={user.user?.name}
                src={avatarSource}
                maxWidth="80%"
                sx={{
                  objectFit: "scale-down",
                }}
              >
              </Box>
              <Button
                  component="label"
                  sx={{
                    position: "absolute",
                    right: "30px",
                    bottom: "-3px",
                    padding: 0,
                  }}
                >
                  <AddAPhotoOutlinedIcon
                    fontSize="large"
                    sx={{ color: theme.palette.primary.dark, padding: 0 }}
                  />
                  <input
                    hidden
                    id="uploaded-photo"
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={onFileChange}
                  />
                </Button>
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
                sx={{ color: theme.palette.primary.dark, mr: 1, my: 1.5, marginLeft: '8px' }}
              />
              <TextField
                variant="outlined"
                name="nickname"
                fullWidth
                id="nickname"
                value={inputValue}
                autoFocus
                error={inputError}
                helperText={inputError ? "This nickname is taken" : ""}
                onChange={nickChange}
                sx={{
                  fieldset: {
                    borderColor: theme.palette.primary.dark,
                  },
                  input:   {
                    color: theme.palette.primary.dark,
                   }
                }}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <TextField
                name="userSearch"
                fullWidth
                id="userSearch"
                label="userSearch"
                autoFocus
                onChange={nickSearch}
              />
            </Grid> */}
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
