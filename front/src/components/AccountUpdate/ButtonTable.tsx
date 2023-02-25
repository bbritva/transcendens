import { Grid } from "@mui/material";
import React from "react";
import { useStore } from "react-redux";
import authService from "src/services/auth.service";
import { RootState } from "src/store/store";
import StyledBox, { styledBox } from "../BasicTable/StyledBox";
import AccountButton from "./StyledButton";

export interface buttonTableI extends styledBox {
  setOpen: Function,
  setUrlQR: Function
}


export default function ButtonTable(props: buttonTableI) {
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const {setOpen, setUrlQR, ...styledProps} = props;
  async function generateTwoFA() {
    const src = await authService.otpGenerateQR();
    if (src){
      
      props.setUrlQR(src);
      props.setOpen(true);
    }
    else
      props.setOpen(false);
  }

  return (
    <StyledBox {...styledProps}>
        {user.user?.isTwoFaEnabled ? (
          <AccountButton
            onClick={() => {
              props.setOpen(true);
            }}
          >
            Disable two factor auth
          </AccountButton>
        ) : (
          <AccountButton onClick={generateTwoFA}>
            Enable two factor auth
          </AccountButton>
        )}
    </StyledBox>
  );
}
