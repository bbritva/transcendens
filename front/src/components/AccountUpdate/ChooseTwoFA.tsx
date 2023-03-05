import {
  Box,
  Button,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
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
    <Box display={"flex"}  flexDirection={"column"} padding={"0"} marginLeft='10px'
    >
      <DialogTitle sx={{ padding: "3px" }}>
        <Typography variant="body1" marginLeft={"2rem"}>{props.title + " 2FA"}
        </Typography>
      </DialogTitle>
      {props.isEnabled && (
        <>
          <DialogContentText>
            <Typography variant="subtitle2" marginLeft="1rem" marginTop={"5px"}>
              1. SCAN YOUR QR CODE WITH THE GOOGLE APP
            </Typography>
          </DialogContentText>
          <Box display={"flex"}>
            <Box
              marginLeft={"8px"}
              maxHeight="80px"
              maxWidth="80px"
              component={"img"}
              alt="2faQR"
              src={props.urlQR}
            />
            <Typography variant="subtitle1">
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
          <DialogContentText>
            <Typography variant="subtitle2" marginLeft="1rem" marginTop="1rem">
              2. ENTER YOUR 6-DIGIT CODE
            </Typography>
          </DialogContentText>
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
