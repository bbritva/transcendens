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
  const { extUser, variant, ...styledProps } = props;
  const [inputValue, setInputValue] = React.useState<string>(username || extUser.name || "");
  const [avatarSource, setAvatarSource] = React.useState<string>("");
  const dispatch = useAppDispatch();
  const nameRegex= /^[A-Za-z0-9\-]+$/;

  const theme = useTheme();

  function isNameValid(name: string){
   if(name.match(nameRegex) && name.length > 3 && name.length < 20)
      return true;
   else
     return false;
  }

  if (socket.connected) {
    socket.on("nameAvailable", (data: {targetUserName: string}) => {
      setInputError(false);
    })
    socket.on("nameTaken", (data: {targetUserName: string}) => {
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
          process.env.REACT_APP_AUTH_URL + `/user/avatar/${extUser.avatar}`
        )
        : setAvatarSource(extUser?.image || "");
  }, [imageUrl, extUser?.avatar]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file){
      const formData = new FormData();
      formData.append("file", file);
      
  
      const res = await userService.uploadAvatar(formData)
          .then((res) => res)
          .catch(() => undefined)
            //@ts-ignore
            if (res?.data?.avatar && extUser) {
              dispatch(updateUser({ ...extUser as userI, avatar: res?.data.avatar }));
            }
            else {
              extUser?.avatar
              ? setAvatarSource(
                process.env.REACT_APP_AUTH_URL + `/user/avatar/${extUser.avatar}`
              )
              : setAvatarSource(extUser?.image || "");
            }
            setFile(null);
    }
    if (!inputError && inputValue !== extUser.name){
      let res;
      if (isNameValid(inputValue))
        res = await userService.setUserName({id: extUser.id, name: inputValue})
      else
        setInputError(true);
      if (res?.status === 200){
        dispatch(updateUser({ ...extUser as userI, ...res.data }));
      }
    }
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
    const val = event.currentTarget.value
    setInputValue(val);
    const timeOutId = setTimeout(() => {
      if (val !== extUser?.name) {
        socket.emit("checkNamePossibility", { targetUserName: val })
      }
    }, 800);
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
                  },
                  "& .MuiInputBase-input.Mui-disabled" : {
                    WebkitTextFillColor: theme.palette.primary.dark,
                  }
                }}
              />
            </Grid>
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
                Save changes
              </AccountButton>
            </Grid>
          }
          </Grid>
        </Box>
      </Box>
    </StyledBox>
  );
}
