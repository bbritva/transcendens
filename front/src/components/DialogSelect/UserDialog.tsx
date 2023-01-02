import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";

const UserDialog: FC = () => {
  return (
    <Box>
      <DialogTitle>'User' actions</DialogTitle>
      <Button>Message</Button>
      <Button>Pong's invite</Button>
      <Button>Profile</Button>
      <Button>Block</Button>
    </Box>
  );
}

export default UserDialog;