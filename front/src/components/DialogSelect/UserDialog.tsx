import { Button, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";

const UserDialog: FC = () => {
  return (
    <>
      <Button>Message</Button>
      <Button>Pong's invite</Button>
      <Button>Profile</Button>
      <Button>Block</Button>
    </>
  );
}

export default UserDialog;