import {
  ReactElement,
  FC,
  forwardRef,
  ForwardedRef,
  useState,
  useEffect,
  ReactNode
} from "react";
import {
  Box,
  CardMedia,
  IconButton,
  Paper,
  Slide,
  useTheme,
} from "@mui/material";
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
import ChooseTwoFA from "src/components/AccountUpdate/ChooseTwoFA";
import useEnableTwoFA from "src/hooks/useEnableTwoFA";
import CloseIcon from "@mui/icons-material/Close";
import StyledBox from "src/components/BasicTable/StyledBox";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import { StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { selectBanned, selectFriends, UserInfoPublic } from "src/store/chatSlice";
import { getGames, selectGames } from "src/store/gamesSlice";
import { useAppDispatch } from "src/app/hooks";
import fakeAvatar from "src/assets/logo192.png";
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import userService from "src/services/user.service";

function createHistoryData(
  score: string,
  result: string,
  rival: string,
  id: number
) {
  return { score, result, rival, id } as matchHistoryRowI;
}

function createPlayerData(data: string | ReactNode, rank: string | ReactNode, id: number) {
  return { data, rank, id } as playerStatisticsRowI;
}

export interface extUserState {
  status: string,
  id: number,
  user: UserInfoPublic
}


const header = ["SCORE", "WIN/LOSE", "RIVALS"];

const AccountPage: FC<any> = (): ReactElement => {
  const { user } = useSelector(selectUser);
  const { games, status, winsNum, losesNum, score } = useSelector(selectGames);
  const theme = useTheme();
  const [slideShow, setSlideShow] = useState<boolean>(false);
  const [open, setOpen, twoFaProps, setUrlQR] = useEnableTwoFA(
    user,
    setSlideShow
  );
  const [slideFriends, setSlideFriends] = useState<boolean>(false);
  const [slideBanned, setSlideBanned] = useState<boolean>(false);
  const friends = useSelector(selectFriends) || [];
  const bannedList = useSelector(selectBanned ) || [];
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [historyRows, setHistoryRows] = useState<matchHistoryRowI[]>([]);
  const username = sessionStorage.getItem("username");
  const [extUser, setExtUser] = useState<extUserState>({status: 'idle', id: 0, user: {} as UserInfoPublic});

  let [searchParams, setSearchParams] = useSearchParams();

  let newUser = searchParams.get("user");

  useEffect(() => {
    let id = parseInt(newUser || '');
    if (isNaN(id))
      return;
    else if (extUser.status !== 'idle' && id === extUser.id)
      return;
    let abortController = new AbortController();
    async function getExtUser(id: number) {
      let response = await userService.getById(id, abortController);
      console.log(response);
      // if (!abortController.signal.aborted) {
      //   let data = await response.json();
      //   setUserData(data);
      // }
    }

    if (id > 0) {
      setExtUser({status: 'loading', id: id, user:{} as UserInfoPublic});
      getExtUser(id);
    }

    return () => {
      abortController.abort();
    };
  }, [newUser]);


  if (status === "idle" && (user?.id || username))
    dispatch(getGames(parseInt(user?.id || "2")));

  useEffect(() => {
    if (status === "succeeded") {
      setHistoryRows(
        games.map((game) =>
          createHistoryData(
            `${game.winnerScore} : ${game.loserScore}`,
            game.winnerId == parseInt(user?.id || "") ? "win" : "lose",
            `${game.id}`,
            game.id
          )
        )
      );
    }
  }, [status]);

  const playerRows = [
    createPlayerData("Total wins: ", winsNum + "", 2),
    createPlayerData("Total losses: ", losesNum + "", 3),
    createPlayerData("Total score: ", score + "", 1),
    createPlayerData(
      <Box display="flex" alignItems="center">
        <SportsCricketIcon color="primary" fontSize="large"/>
        Rating:
      </Box>,
        11+'',
        4
      ),
  ];

  const createButtons = (friend: UserInfoPublic) =>{
    return [
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => setSearchParams({user: friend.id + ''}, {replace: false}),
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
  };

  const createFriendElem = (friend: UserInfoPublic): settingsRowI => {
    const FriendComponent = (
      <BasicMenu title={friend.name} extAvatar={friend.avatar || friend.image || fakeAvatar} mychildren={createButtons(friend)} />
    );
    return { id: friend.id, button: FriendComponent };
  };

  const FriendsTableRef = forwardRef(function FriendsTableRef(
    props: basicTableI,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return <BasicTable myRef={ref} {...props} />;
  });

  const refFriendsProps = {
    title: "FRIENDS",
    tableHeadArray: null,
    mybackcolor: theme.palette.info.main,
    myalign: "start",
    tableRowArray: friends.map(
      (friend): settingsRowI => createFriendElem(friend)
    ),
    onClose: () => {
      setOpen(false);
    },
  };

  const refBannedsProps = {
    title: "BANNED",
    tableHeadArray: null,
    mybackcolor: theme.palette.info.main,
    myalign: "start",
    tableRowArray: bannedList.map(
      (friend): settingsRowI => createFriendElem(friend)
    ),
    onClose: () => {
      setOpen(false);
    },
  };

  return (
    <Box
      component={CardMedia}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      sx={{
        boxShadow: "20",
        background: "linear-gradient(to top, #8bd4d1, 15%, #ecebd9)",
        width: "65vw",
        height: "90vh",
        overflow: "scroll",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        [theme.breakpoints.down("md")]: {
          overflowY: "scroll",
        },
      }}
    >
      <SignUp extUser={extUser.status === 'succeeded' && extUser.user} myalign="end" />
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
          {
            slideFriends
            ? <FriendsTableRef {
              ...(slideBanned  
              ? refBannedsProps
              : refFriendsProps)
            } />
            : <StyledBox myalign="start" mybackcolor={theme.palette.info.main}>
                <IconButton
                  aria-label="close"
                  onClick={() => setOpen(false)}
                  sx={{
                    position: "absolute",
                    right: "2px",
                    top: "1px",
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <ChooseTwoFA {...twoFaProps} />
              </StyledBox>
          }
        </Slide>
      )}
      {!open && !slideShow && (
        <ButtonTable
          setOpen={setOpen}
          setSlideShow={setSlideShow}
          setUrlQR={setUrlQR}
          setSlideFriends={setSlideFriends}
          setSlideBanned={setSlideBanned}
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
