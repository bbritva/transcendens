import React, { ReactElement, FC } from "react";
import { Box, Paper, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectUser, updateUser } from "src/store/userSlice";
import BasicTable, {
  basicTableI,
  matchHistoryRowI,
  playerStatisticsRowI,
} from "src/components/BasicTable/BasicTable";
import ButtonTable from "src/components/AccountUpdate/ButtonTable";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import ChooseTwoFA, { twoFAdialogProps } from "src/components/AccountUpdate/ChooseTwoFA";
import authService from "src/services/auth.service";
import { useAppDispatch } from "src/app/hooks";

function createHistoryData(
  score: string,
  result: string,
  rival: string,
  id: number
) {
  return { score, result, rival, id } as matchHistoryRowI;
}

const historyRows = [
  createHistoryData("Frozen yoghurt", "159", "6.0", 24),
  createHistoryData("Ice cream sandwich", "237", "9.0", 37),
  createHistoryData("Eclair", "262", "16.0", 24),
  createHistoryData("Cupcake", "305", "3.7", 67),
  createHistoryData("Gingerbread", "356", "16.", 49),
];

function createPlayerData(data: string, rank: string, id: number) {
  return { data, rank, id } as playerStatisticsRowI;
}

const playerRows = [
  createPlayerData("Game level: ", "159", 24),
  createPlayerData("Total wins: ", "237", 37),
  createPlayerData("Total losses: ", "262", 24),
];

const header = ["Score", "Win/Lose", "Rivals"];

const AccountPage: FC<any> = (): ReactElement => {
  const { user, status, error } = useSelector(selectUser);
  const theme = useTheme();
  const [open, setOpen] = React.useState<boolean>(false);
  const [urlQR, setUrlQR] = React.useState<any>();
  const [otpValue, setOtpValue] = React.useState<string>("");
  const [otpError, setOtpError] = React.useState<boolean>(false);
  const dispatch = useAppDispatch();

  const props = {
    tableHeadArray: header,
  } as basicTableI;

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

  return (
    <Box
      component={Paper}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      sx={{
        backgroundColor: theme.palette.secondary.light,
        width: "65vw",
        height: "80vh",
        overflow: "scroll",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        [theme.breakpoints.down("md")]: {
          overflowY: "scroll",
          alignContent: "flex-start",
        },
      }}
    >
      <DialogSelect options open={open} setOpen={setOpen}>
        <ChooseTwoFA
          {...(user?.isTwoFaEnabled ? disableProps : enableProps)}
        />
      </DialogSelect>
      <SignUp />
      <BasicTable
        title="Player stats"
        tableHeadArray={null}
        tableRowArray={playerRows}
        myBackColor={theme.palette.info.main}
        myAlign="end"
      />
      <ButtonTable
        setOpen={setOpen}
        setUrlQR={setUrlQR}
        myBackColor={theme.palette.info.main}
        myAlign="start"
      />
      <BasicTable
        title="Match history"
        tableHeadArray={header}
        tableRowArray={historyRows}
        myBackColor={theme.palette.primary.main}
      />
    </Box>
  );
};

export default AccountPage;
