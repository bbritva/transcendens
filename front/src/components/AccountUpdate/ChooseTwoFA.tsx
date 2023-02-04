import { Box, Button, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { ChangeEventHandler, FC } from "react";
import Link from '@mui/material/Link';

export interface twoFAdialogProps {
    title: string 
    urlQR: string
    isEnabled: boolean
    onClick: () => {}
    onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    value: string
    error: boolean
}

const ChooseTwoFA: FC<twoFAdialogProps> = (props: twoFAdialogProps) => {
  return (
    <Box
    display={'grid'}
    padding={'2rem'}
    paddingTop={'1rem'}
  >
    <DialogTitle>{props.title} 2FA</DialogTitle>
    { props.isEnabled && <>
      <DialogContentText>1. Scan QR code with auth app</DialogContentText>
      <Link href='https://apps.apple.com/fr/app/google-authenticator/id388497605'
        marginLeft={'1rem'}
        target={'_blank'}
      >
        iOs
      </Link>
      <Link href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr&gl=US&pli=1'
        marginLeft={'1rem'}
        target={'_blank'}
      >
        Android
      </Link>
      <Box
        component={'img'}
        alt="2faQR"
        src={props.urlQR}
      />
      <DialogContentText>2. Enter google auth app</DialogContentText>
    </>
    }
    <TextField
      error={props.error}
      helperText={props.error ? 'Wrong authentication code' : ''}
      label={'otp code'}
      onChange={props.onChange}
      onKeyUp={(e) => {
        if (e.key === 'Enter')
          props.onClick();
      }}
      margin="dense"/>
    <Button
      variant="outlined"
      sx={{
        alignSelf: 'end'
      }}
      onClick={props.onClick}
      disabled={!props.value}
    >
      {props.title} 2FA
    </Button>
  </Box>
  );
}

export default ChooseTwoFA;