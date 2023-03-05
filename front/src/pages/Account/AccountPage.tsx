import {
  ReactElement,
  FC,
  forwardRef,
  ForwardedRef,
  useState,
  useEffect
} from "react";
import { Box, IconButton, Paper, Slide, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectUser } from "src/store/userSlice";
import BasicTable, {
  basicTableI,
  matchHistoryRowI,
  playerStatisticsRowI,
  settingsRowI,
} from "src/components/BasicTable/BasicTable";
import ButtonTable from "src/components/AccountUpdate/ButtonTable";
import ChooseTwoFA, {
} from "src/components/AccountUpdate/ChooseTwoFA";
import useEnableTwoFA from "src/hooks/useEnableTwoFA";
import CloseIcon from "@mui/icons-material/Close";
import StyledBox from "src/components/BasicTable/StyledBox";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import { StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { useNavigate } from "react-router-dom";
import { selectFriends } from "src/store/chatSlice";
import { getGames, selectGames } from "src/store/gamesSlice";
import { useAppDispatch } from "src/app/hooks";

function createHistoryData(
  score: string,
  result: string,
  rival: string,
  id: number
) {
  return { score, result, rival, id } as matchHistoryRowI;
}

function createPlayerData(data: string, rank: string, id: number) {
  return { data, rank, id } as playerStatisticsRowI;
}

const playerRows = [
  createPlayerData("Game level: ", "159", 35),
  createPlayerData("Total wins: ", "237", 37),
  createPlayerData("Total losses: ", "262", 24),
];

const header = ["SCORE", "WIN/LOSE", "RIVALS"];

const AccountPage: FC<any> = (): ReactElement => {
  const { user } = useSelector(selectUser);
  const { games, status } = useSelector(selectGames);
  const theme = useTheme();
  const [slideShow, setSlideShow] = useState<boolean>(false);
  const [open, setOpen, twoFaProps, setUrlQR] = useEnableTwoFA(
    user,
    setSlideShow
  );
  const [slideFriends, setSlideFriends] = useState<boolean>(false);
  const friends = useSelector(selectFriends) || [];
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [historyRows, setHistoryRows] = useState<matchHistoryRowI[]>([]);
  const username = sessionStorage.getItem("username");

  if (status === 'idle' && (user?.id || username))
    dispatch(getGames(parseInt(user?.id || '2')));

  useEffect(() => {
    if (status === 'succeeded') {
      setHistoryRows(games.map((game) =>
        createHistoryData(
          `${game.winnerScore} : ${game.loserScore}`,
          game.winnerId == parseInt(user?.id || '')
            ? 'win' : 'lose',
          `${game.id}`,
          game.id
        )))
    }
  }, [status]);

  const buttons = [
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/account", { replace: true }),
        children: "Profile",
      },
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/chat", { replace: true }),
        children: "Message",
      },
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/game", { replace: true }),
        children: "Game",
      },
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/game", { replace: true }),
        children: "Delete",
      },
    },
  ];

  const createFriendElem = (id: number, name: string): settingsRowI => {
    const FriendComponent = (
      <BasicMenu title={name} onLogout={() => {}} mychildren={buttons} />
    );
    return { id, button: FriendComponent };
  };

  const FriendsTableRef = forwardRef(function FriendsTableRef(
    props: basicTableI,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return <BasicTable myRef={ref} {...props} />;
  });

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
        height: "90vh",
        overflow: "scroll",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        [theme.breakpoints.down("md")]: {
          overflowY: "scroll",
          alignContent: "center",
        },
      }}
    >
      <SignUp myalign="end"  />
      <BasicTable
        title="PLAYER STATISTICS"
        tableHeadArray={null}
        tableRowArray={playerRows}
        mybackcolor={theme.palette.info.main}
        myalign="end"
      />
      {slideShow && (
        <Slide
          direction="right"
          in={open}
          timeout={800}
          appear={true}
          addEndListener={() => {
            if (!open)
              setTimeout(() => {
                setSlideShow(false);
              }, 600);
          }}
        >
          {slideFriends ? (
            <FriendsTableRef
              title="FRIENDS"
              tableHeadArray={null}
              mybackcolor={theme.palette.info.main}
              myalign="start"
              flexDirection={"column"}
              tableRowArray={
                friends.map((friend): settingsRowI =>
                  createFriendElem(friend.id, friend.name)
                )
              }
              onClose={() => {
                setOpen(false);
              }}
            />
          ) : (
            <StyledBox
              myalign="start"
              flexDirection={"column"}
              mybackcolor={theme.palette.info.main}
            >
              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{
                  alignSelf: "end",
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <ChooseTwoFA {...twoFaProps} />
            </StyledBox>
          )}
        </Slide>
      )}
      {!open && !slideShow && (
        <ButtonTable
          setOpen={setOpen}
          setSlideShow={setSlideShow}
          setUrlQR={setUrlQR}
          setSlideFriends={setSlideFriends}
          mybackcolor={theme.palette.info.main}
          myalign="start"
          flexDirection={"column"}
        />
      )}
      <BasicTable
        title="MATCH HISTORY"
        tableHeadArray={header}
        tableRowArray={historyRows}
        mybackcolor={theme.palette.primary.main}
        myalign="start"
      />
    </Box>
  );
};

export default AccountPage;
