import { ReactElement, FC } from "react";
import { Box, Paper, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectUser} from "src/store/userSlice";
import BasicTable, {
  matchHistoryRowI,
  playerStatisticsRowI,
} from "src/components/BasicTable/BasicTable";
import ButtonTable from "src/components/AccountUpdate/ButtonTable";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import ChooseTwoFA from "src/components/AccountUpdate/ChooseTwoFA";

import useEnableTwoFA from "src/hooks/useEnableTwoFA";

function createHistoryData(
  score: string,
  result: string,
  rival: string,
  id: number
) {
  return { score, result, rival, id } as matchHistoryRowI;
}

const historyRows = [
  createHistoryData("Frozen yoghurt", "159", "6.0", 15),
  createHistoryData("Ice cream sandwich", "237", "9.0", 37),
  createHistoryData("Eclair", "262", "16.0", 13),
  createHistoryData("Cupcake", "305", "3.7", 67),
  createHistoryData("Gingerbread", "356", "16.", 49),
];

function createPlayerData(data: string, rank: string, id: number) {
  return { data, rank, id } as playerStatisticsRowI;
}

const playerRows = [
  createPlayerData("Game level: ", "159", 35),
  createPlayerData("Total wins: ", "237", 37),
  createPlayerData("Total losses: ", "262", 24),
];

const header = ["Score", "Win/Lose", "Rivals"];

const AccountPage: FC<any> = (): ReactElement => {
  const { user, status, error } = useSelector(selectUser);
  const theme = useTheme();
  const [open, setOpen, twoFaProps, setUrlQR] = useEnableTwoFA(user);
  
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
          {...twoFaProps}
        />
      </DialogSelect>
      <SignUp />
      <BasicTable
        title="Player stats"
        tableHeadArray={null}
        tableRowArray={playerRows}
        mybackcolor={theme.palette.info.main}
        myalign="end"
      />
      <ButtonTable
        setOpen={setOpen}
        setUrlQR={setUrlQR}
        mybackcolor={theme.palette.info.main}
        myalign="start"
      />
      <BasicTable
        title="Match history"
        tableHeadArray={header}
        tableRowArray={historyRows}
        mybackcolor={theme.palette.primary.main}
      />
    </Box>
  );
};

export default AccountPage;
