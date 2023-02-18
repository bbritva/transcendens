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
      flexWrap="wrap"
      sx={{
        backgroundColor: theme.palette.secondary.light,
        width: "80vw",
      }}
    >
      <Box flex={1} justifyContent='end' display='grid'>
        <SignUp />
        <StyledTable
          title="Settings"
          tableHeadArray={null}
          tableRowArray={playerRows}
          myBackColor={"info.main"}
        />
      </Box>
      <Box flex={1} justifyContent='start' display='grid'>
        <StyledTable
          title="Player stats"
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
    </Box>
  );
};

export default AccountPage;
