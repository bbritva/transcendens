import {
  Box,
  Button,
  DialogContentText,
  DialogTitle,
  TextField,
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
  return (
    <Box display={"flex"} flexDirection={"column"} padding={"0"}>
      <DialogTitle sx={{ padding: "3px" }}>{props.title} 2FA</DialogTitle>
      {props.isEnabled && (
        <>
          <DialogContentText>1. Scan QR code with auth app</DialogContentText>
          <Box display={"flex"}>
            <Box
              marginLeft={"8px"}
              maxHeight="80px"
              maxWidth="80px"
              component={"img"}
              alt="2faQR"
              src={props.urlQR}
            />
            <Link
              href="https://apps.apple.com/fr/app/google-authenticator/id388497605"
              marginLeft={"1rem"}
              target={"_blank"}
              color={"secondary"}
            >
              iOs
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr&gl=US&pli=1"
              marginLeft={"1rem"}
              target={"_blank"}
              color={"secondary"}
            >
              Android
            </Link>
          </Box>
          <DialogContentText>2. Enter google auth app</DialogContentText>
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
      />
      <Button
        variant="outlined"
        sx={{
          alignSelf: "end",
        }}
        onClick={props.onClick}
        disabled={!props.value}
      >
        {props.title} 2FA
      </Button>
    </Box>
  );
};

export default ChooseTwoFA;
