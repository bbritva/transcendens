import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";

const ChannelOwnerDialog: FC = () => {
  return (
    <Box>
      <DialogTitle>'Channel' actions</DialogTitle>
      <Button>Set as adm in 'channel'</Button>
      <Button>Ban in 'channel'</Button>
      <Button>Mute in 'channel'</Button>
    </Box>
  );
}

export default ChannelOwnerDialog;