import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useStore } from "react-redux";
import { updateUser, userI } from "src/store/userSlice";
import userService from "src/services/user.service";
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
  extUser: UserInfoPublic,
  variant: boolean
}

export default function SignUp(props: AccountUpdateProps) {
  const username = sessionStorage.getItem("username");
  const [file, setFile] = React.useState<any>();
  const [imageUrl, setImageUrl] = React.useState<any>();
  const [inputError, setInputError] = React.useState<boolean>(false);
  const { getState } = useStore();
  // const { user } = getState() as RootState;
  const { extUser, variant, ...styledProps } = props;
  const [inputValue, setInputValue] = React.useState<string>(username || extUser.name || "");
  const [avatarSource, setAvatarSource] = React.useState<string>("");
  const dispatch = useAppDispatch();

  const theme = useTheme();

  if (socket.connected) {
    socket.on("nameAvailable", (data: fromBackI) => {
      setInputError(false);
    })
    socket.on("nameTaken", (data: fromBackI) => {
      setInputError(true);
    })
  }

  React.useEffect(() => {
    if (extUser.name)
      setInputValue(extUser.name);
  }, [extUser.name])


  React.useEffect(() => {
    if (file?.name) {
      setImageUrl(URL.createObjectURL(file));
    }
  }, [file, file?.name]);

  React.useEffect(() => {
    imageUrl
      ? setAvatarSource(imageUrl)
      : extUser?.avatar
        ? setAvatarSource(
          process.env.REACT_APP_USERS_URL + `/avatar/${extUser.avatar}`
        )
        : setAvatarSource(extUser?.image || "");
  }, [imageUrl, extUser?.avatar]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    const res = await userService.uploadAvatar(formData);
    if (res.data?.avatar && extUser) {
      dispatch(updateUser({ ...extUser as userI, avatar: res.data.avatar }));
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
      if (val !== extUser?.name) {
        socket.emit("checkNamePossibility", { targetUserName: val })
      }
    }, 800);
  }

  function nickSearch(this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
    socket.emit("getNamesSuggestions", { targetUserName: event.currentTarget.value })
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
          <Grid container
            justifyContent="center"
          >
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
                alt={extUser?.name}
                src={avatarSource}
                maxWidth="80%"
                sx={{
                  objectFit: "scale-down",
                }}
              >
              </Box>
              {variant &&
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
                </Button>}
            </Box>
            <Grid
              item
              xs={12}
              display="flex"
              alignItems="flex-start"
              marginTop={3}
            >
              <AlternateEmailIcon
                fontSize="large"
                sx={{ color: theme.palette.primary.dark, mr: 1, my: 1.5, marginLeft: '8px' }}
              />
              <TextField
                disabled={!variant}
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
                  marginRight: 1,
                  fieldset: {
                    borderColor: theme.palette.primary.dark,
                  },
                  input: {
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
          {
            variant &&
            <Grid
              item
              xs={12}
              display="flex"
              alignItems="flex-start"
            >
              <AccountButton type="submit">
                <CloudSyncIcon fontSize="large" sx={{ mr: 1, my: 1.5 }} />
                Update
              </AccountButton>
            </Grid>
          }
          </Grid>
        </Box>
      </Box>
    </StyledBox>
  );
}
