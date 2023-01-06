import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";

const ChannelSettingsDialog: FC = () => {
  return (
    <Box>
      <DialogTitle>'Channel' settings</DialogTitle>
      <Button>Change name 'channel'</Button>
      <Button>Set 'channel' private</Button>
      <Button>Change pass 'channel'</Button>
    </Box>
  );
}

export default ChannelSettingsDialog;