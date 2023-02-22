import { ReactElement, FC } from "react";
import { Box, Paper, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectUser } from "src/store/userSlice";
import BasicTable, {
  basicTableI,
  matchHistoryRowI,
  playerStatisticsRowI,
  rowI,
} from "src/components/BasicTable/BasicTable";
import StyledTable from "src/components/BasicTable/StyledTable";

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
  const props = {
    tableHeadArray: header,
  } as basicTableI;

  return (
    <Box
      component={Paper}
      display="flex"
      alignContent='center'
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      sx={{
        backgroundColor: theme.palette.secondary.light,
        width: "65vw",
        height: "80vh",
        [theme.breakpoints.down("lg")]: { overflowY: 'scroll', alignContent: "flex-start" },
      }}
    >
      <SignUp />
      {/* <StyledTable
        title="Player stats"
        tableHeadArray={null}
        tableRowArray={playerRows}
        myBackColor={"info.main"}
      /> */}
      <StyledTable
        title="Player stats"
        tableHeadArray={null}
        tableRowArray={playerRows}
        myBackColor={"info.main"}
      />
      <StyledTable
        title="Settings"
        tableHeadArray={null}
        tableRowArray={playerRows}
        myBackColor={"info.main"}
      />
      <StyledTable
        title="Match history"
        tableHeadArray={header}
        tableRowArray={historyRows}
        myBackColor={"primary.main"}
      />
    </Box>
  );
};

export default AccountPage;
