import {
  Box,
  Button,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ChangeEventHandler, FC } from "react";
import Link from "@mui/material/Link";

export interface twoFAdialogProps {
  title: string;
  urlQR: string;
  isEnabled: boolean;
  onClick: () => {};
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  value: string;
  error: boolean;
}

const ChooseTwoFA: FC<twoFAdialogProps> = (props: twoFAdialogProps) => {
  const theme = useTheme();
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      padding={"0"}
      marginLeft="25px"
      marginBottom={"0.5rem"}
    >
      <DialogTitle sx={{ padding: "3px" }}>
        <Typography paddingTop={"2px"} variant="body1" marginLeft={"4rem"}>
          {props.title + " 2FA"}
        </Typography>
      </DialogTitle>
      {props.isEnabled && (
        <>
          <Typography
            variant="subtitle2"
            marginLeft="3rem"
            marginRight="1rem"
          >
            Scan the QR code
          </Typography>
          <Box display={"flex"}>
            <Box
              marginLeft={"3rem"}
              maxHeight="80px"
              maxWidth="100px"
              component={"img"}
              alt="2faQR"
              src={props.urlQR}
            />
            <Typography paddingTop={"1rem"} variant="h6">
              <Link
                href="https://apps.apple.com/fr/app/google-authenticator/id388497605"
                marginLeft={"1rem"}
                target={"_blank"}
              >
                iOs
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr&gl=US&pli=1"
                marginLeft={"1rem"}
                target={"_blank"}
              >
                Android
              </Link>
            </Typography>
          </Box>

          <Typography
            variant="subtitle2"
            marginLeft="3rem"
            marginRight="1rem"
            marginTop="0.2rem"
          >
            Enter the code from the app
          </Typography>
        </>
      )}
      <TextField
        error={props.error}
        helperText={props.error ? "Wrong authentication code" : ""}
        onChange={props.onChange}
        onKeyUp={(e) => {
          if (e.key === "Enter") props.onClick();
        }}
        margin="dense"
        sx={{
          marginLeft: "3rem",
          marginRight: "2rem",
          fieldset: {
            borderColor: theme.palette.primary.dark,
          },
          input: {
            color: theme.palette.primary.dark,
          },
        }}
      />
      <Button
        variant="outlined"
        sx={{
          alignSelf: "end",
          marginRight: "2rem",
        }}
        onClick={props.onClick}
        disabled={!props.value}
      >
        <Typography variant="subtitle1">{props.title} 2FA</Typography>
      </Button>
    </Box>
  );
};

export default ChooseTwoFA;
