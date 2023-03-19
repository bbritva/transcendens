import {
  ReactElement,
  FC,
  forwardRef,
  ForwardedRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Box, CardMedia, IconButton, Slide, useTheme } from "@mui/material";
import { useSelector, useStore } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { userI } from "src/store/userSlice";
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
import { getGames, getLadder, selectGames } from "src/store/gamesSlice";
import { useAppDispatch } from "src/app/hooks";
import fakeAvatar from "src/assets/logo192.png";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { extUserState } from "./AccountPageWrapper";
import socket from "src/services/socket";
import { RootState } from "src/store/store";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

function createHistoryData(
  score: string,
  result: string,
  rival: string,
  id: string
) {
  return { score, result, rival, id } as matchHistoryRowI;
}

function createPlayerData(
  data: string | ReactNode,
  rank: string | ReactNode,
  id: string
) {
  return { data, rank, id } as playerStatisticsRowI;
}

const header = ["SCORE", "WIN/LOSE", "RIVALS"];

const AccountPage: FC<{ extUser: extUserState; variant: boolean }> = ({
  extUser,
  variant,
}): ReactElement => {
  const theme = useTheme();
  const [slideShow, setSlideShow] = useState<boolean>(false);
  const [open, setOpen, twoFaProps, setUrlQR] = useEnableTwoFA(
    extUser.user as userI,
    setSlideShow
  );
  const [slideFriends, setSlideFriends] = useState<boolean>(false);
  const [slideBanned, setSlideBanned] = useState<boolean>(false);
  const bannedList = useSelector(selectBanned) || [];
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [historyRows, setHistoryRows] = useState<matchHistoryRowI[]>([]);
  const username = sessionStorage.getItem("username");
  let [searchParams, setSearchParams] = useSearchParams();
  const { winsNum, losesNum, score } = useSelector(selectGames);
  const friends = useSelector(selectFriends) || [];
  const [status, setStatus] = useState(false);
  const {getState} = useStore();
  const {games} = getState() as RootState;
  const [rating , setRating] = useState<string>('0');


  useEffect(() => {
    if (status) {
      console.log(games);
      setHistoryRows(
        games.games.map((game) =>
          createHistoryData(
            `${game.winnerScore} : ${game.loserScore}`,
            game.winnerId == parseInt(extUser.user?.id || "") ? "win" : "lose",
            game.winnerId == parseInt(extUser.user?.id || "") ? game.loser.name : game.winner.name,
            game.id
          )
        )
      );
    }
  }, [status]);

  useEffect(() => {
    if (extUser.user.id && extUser.status !== 'loading') {
      dispatch(getGames({ userId: parseInt(extUser.user.id), set: setStatus }));
    }
  }, [extUser.user.id]);

  useEffect(() => {
    if (status && extUser.user.id && extUser.status !== 'loading') {
      dispatch(getLadder());
    }
  }, [status]);

  useEffect(() => {
    if (games?.ladder?.length)
      setRating(
        (games.ladder.findIndex((player) => 
          player.id + '' === extUser.user.id + ''
        ) + 1) + ''
    )
  }, [games.ladder?.length])

  const playerRows = [
    createPlayerData("Total wins: ", winsNum + "", "2"),
    createPlayerData("Total losses: ", losesNum + "", "3"),
    createPlayerData("Total score: ", score + "", "1"),
    createPlayerData(
      <Box display="flex" alignItems="center">
        Rating
        <SportsCricketIcon
          fontSize='medium'
          sx={{
            color: theme.palette.primary.dark,
            marginLeft: "1rem",
          }}
        />
        <EmojiEventsOutlinedIcon
          fontSize="large"
          sx={{
            color: theme.palette.primary.dark,
          }}
        />
      </Box>,
      rating,
      '4'
    ),
  ];

  const createButtons = (friend: UserInfoPublic, banned?: boolean) => {
    const res = [
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => {
            setSearchParams({ user: friend.id + "" }, { replace: false });
          },
          children: "Profile",
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => {
            socket.emit(banned ? "unbanPersonally" : "removeFriend", {
              targetUserName: friend.name,
            });
          },
          children: banned ? "Unban" : "Delete",
        },
      },
    ];
    if (!banned) {
      res.push({
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => navigate("/chat", { replace: false }),
          children: "Message",
        },
      });
      res.push({
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => navigate("/game", { replace: false }),
          children: "Game",
        },
      });
    }
    return res;
  };

  const createFriendElem = (
    friend: UserInfoPublic,
    banned: boolean
  ): settingsRowI => {
    const FriendComponent = (
      <Box display='flex' alignItems={'center'}>
          { friend.status === 'ONLINE' && <WifiIcon color="info" />}
          { friend.status === 'OFFLINE' && <WifiOffIcon color="primary" />}
          { friend.status === 'ONGAME' && <SportsEsportsIcon color="info" />}
        <BasicMenu fullwidth={true} title={friend.name} extAvatar={friend.avatar || friend.image || fakeAvatar} mychildren={createButtons(friend, banned)} />
      </Box>
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
      (friend): settingsRowI => createFriendElem(friend, false)
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
      (friend): settingsRowI => createFriendElem(friend, true)
    ),
    onClose: () => {
      setOpen(false);
    },
  };

  return (
    <Box
      component={CardMedia}
      display="flex"
      alignItems={"center"}
      justifyContent={"center"}
      flexWrap="wrap"
      sx={{
        boxShadow: "20",
        background:
          "linear-gradient(to top, " +
          theme.palette.primary.main +
          ", 15%, " +
          theme.palette.secondary.main +
          ")",
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
      <SignUp extUser={extUser.user} variant={variant} myalign="end" />
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
              {...(slideBanned ? refBannedsProps : refFriendsProps)}
            />
          ) : (
            <StyledBox myalign="start" mybackcolor={theme.palette.info.main}>
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
          )}
        </Slide>
      )}
      {!open && !slideShow && variant && (
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
        mybackcolor={theme.palette.info.main}
        myalign="start"
      />
    </Box>
  );
};

export default AccountPage;
