import { useStore } from "react-redux";
import authService from "src/services/auth.service";
import { RootState } from "src/store/store";
import StyledBox, { styledBoxI } from "../BasicTable/StyledBox";
import AccountButton from "./StyledButton";
import GppGoodIcon from "@mui/icons-material/GppGood";
import RemoveModeratorIcon from "@mui/icons-material/RemoveModerator";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BlockIcon from '@mui/icons-material/Block';

export interface buttonTableI extends styledBoxI {
  setOpen: Function;
  setUrlQR: Function;
  setSlideBanned: Function;
  setSlideFriends: Function;
  setSlideShow: Function;
}

export default function ButtonTable(props: buttonTableI) {
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const { setOpen, setUrlQR, setSlideFriends, setSlideShow, setSlideBanned, ...styledProps } = props;
  async function generateTwoFA() {
    const src = await authService.otpGenerateQR();
    props.setSlideFriends(false);
    props.setSlideBanned(false);
    if (src) {
      props.setUrlQR(src);
      props.setOpen(true);
      props.setSlideShow(true);
    } else props.setOpen(false);
  }

  return (
    <StyledBox {...styledProps}>
      {user.user?.isTwoFaEnabled ? (
        <AccountButton
          onClick={() => {
            props.setSlideFriends(false);
            props.setSlideBanned(false);
            props.setOpen(true);
            props.setSlideShow(true);
          }}
        >
          <RemoveModeratorIcon fontSize="large" sx={{ mr: 1, my: 1.5 }} />
          Disable two factor auth
        </AccountButton>
      ) : (
        <AccountButton onClick={generateTwoFA}>
          <GppGoodIcon fontSize="large" sx={{ mr: 1, my: 1.5 }} />
          Enable two factor auth
        </AccountButton>
      )}
      <AccountButton
        onClick={() => {
          props.setSlideBanned(false);
          props.setSlideFriends(true);
          props.setOpen(true);
          props.setSlideShow(true);
        }}
      >
        <PeopleOutlineIcon fontSize="large" sx={{ mr: 1, my: 1.5 }} />
        Friends
      </AccountButton>
      <AccountButton
        onClick={() => {
          props.setSlideBanned(true);
          props.setSlideFriends(true);
          props.setOpen(true);
          props.setSlideShow(true);
        }}
      >
        <BlockIcon fontSize="large" sx={{ mr: 1, my: 1.5 }} />
        Banned users
      </AccountButton>
    </StyledBox>
  );
}
