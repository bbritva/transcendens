import { ReactElement, FC, forwardRef, ForwardedRef, useState, useEffect } from "react";
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
import ChooseTwoFA, { twoFAdialogProps } from "src/components/AccountUpdate/ChooseTwoFA";
import useEnableTwoFA from "src/hooks/useEnableTwoFA";
import CloseIcon from "@mui/icons-material/Close";
import StyledBox from "src/components/BasicTable/StyledBox";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import { StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { useNavigate } from "react-router-dom";

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
  const [slideShow, setSlideShow] = useState<boolean>(false);
  const [open, setOpen, twoFaProps, setUrlQR] = useEnableTwoFA(user, setSlideShow);
  const [slideFriends, setSlideFriends] = useState<boolean>(false);
  const navigate = useNavigate();

  const buttons = [
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/account", { replace: true }),
        children: "Profile"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/chat", { replace: true }),
        children: "Message"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/game", { replace: true }),
        children: "Game"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/game", { replace: true }),
        children: "Delete"
      }
    },
  ];

  const createFriendElem = (id: number, name: string): settingsRowI => {
    const FriendComponent = (
      <BasicMenu
        title={name}
        onLogout={() => { }}
        mychildren={buttons}
      />
    );
    return { id, button: FriendComponent };
  };

  const FriendsTableRef = forwardRef(function FriendsTableRef(
    props: basicTableI,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return <BasicTable myRef={ref} {...props} />;
  });

  const EnableTwoFaRef = forwardRef(function EnableTwoFaRef(
    props: {
      twoFAProps: twoFAdialogProps,
      setOpen: Function
    },
    ref: ForwardedRef<HTMLDivElement>
  ) {
    return (<StyledBox
      myalign="start"
      ref={ref}
      flexDirection={"column"}
      mybackcolor={theme.palette.info.main}
    >
      <IconButton
        aria-label="close"
        onClick={() => props.setOpen(false)}
        sx={{
          alignSelf: "end",
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <ChooseTwoFA {...props.twoFAProps} />
    </StyledBox>);
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
          alignContent: "flex-start",
        },
      }}
    >
      <SignUp myalign="end"/>
      <BasicTable
        title="Player stats"
        tableHeadArray={null}
        tableRowArray={playerRows}
        mybackcolor={theme.palette.info.main}
        myalign="end"
      />
      { (slideShow) && 
        <Slide direction="right" in={open}
        timeout={800} appear={true}
        addEndListener={() => {
          if (!open)
            setTimeout(() => {setSlideShow(false);}, 600);
        }}
        >
          {slideFriends ? (
            <FriendsTableRef
              title="Friends"
              tableHeadArray={null}
              mybackcolor={theme.palette.info.main}
              myalign="start"
              flexDirection={"column"}
              tableRowArray={[
                createFriendElem(111, "Vasya"),
                createFriendElem(1112, "Vasya2"),
                createFriendElem(1113, "Vasya3"),
              ]}
              onClose={() => {
                setOpen(false);
              }}
            />
          ) : (
            <EnableTwoFaRef
              twoFAProps={twoFaProps}
              setOpen={setOpen}
            />
          )}
        </Slide>
      }
      { (!open && !slideShow) && (
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
        title="Match history"
        tableHeadArray={header}
        tableRowArray={historyRows}
        mybackcolor={theme.palette.primary.main}
        myalign="start"
      />
    </Box>
  );
};

export default AccountPage;
