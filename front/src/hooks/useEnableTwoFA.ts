import React from "react";
import { useAppDispatch } from "src/app/hooks";
import { twoFAdialogProps } from "src/components/AccountUpdate/ChooseTwoFA";
import authService from "src/services/auth.service";
import { updateUser, userI } from "src/store/userSlice";


export default function useEnableTwoFA(
user: userI | null
) : [boolean, Function, twoFAdialogProps, Function]
{
    const [open, setOpen] = React.useState<boolean>(false);
    const [urlQR, setUrlQR] = React.useState<any>();
    const [otpValue, setOtpValue] = React.useState<string>("");
    const [otpError, setOtpError] = React.useState<boolean>(false);
    const dispatch = useAppDispatch();

    async function enableTwoFA() {
        setOtpError(false);
        const userEnable = await authService.otpTurnOn(otpValue);
        if (!userEnable?.isTwoFaEnabled) {
          setOtpError(true);
          return;
        }
        setOpen(false);
        setTimeout(() => {
          dispatch(updateUser({ ...userEnable }));
        }, 140);
      }
    
      async function disableTwoFA() {
        setOtpError(false);
        const userDisable = await authService.otpTurnOff(otpValue);
        if (userDisable.isTwoFaEnabled) {
          setOtpError(true);
          return;
        }
        setOpen(false);
        setTimeout(() => {
          dispatch(updateUser({ ...userDisable }));
        }, 140);
      }
    
      function onChange(
        this: any,
        event: React.ChangeEvent<HTMLTextAreaElement>
      ): void {
        // event.preventDefault();
        setOtpValue(event.currentTarget.value);
      }
    
    
      const enableProps: twoFAdialogProps = {
        title: "Enable",
        urlQR: urlQR,
        isEnabled: true,
        onClick: enableTwoFA,
        onChange: onChange,
        value: otpValue,
        error: otpError,
      };
    
      const disableProps: twoFAdialogProps = {
        title: "Disable",
        urlQR: urlQR,
        isEnabled: false,
        onClick: disableTwoFA,
        onChange: onChange,
        value: otpValue,
        error: otpError,
      };
      const twoFaProps = (user?.isTwoFaEnabled ? disableProps : enableProps);
      return (
        [open, setOpen, twoFaProps, setUrlQR]
      )
}