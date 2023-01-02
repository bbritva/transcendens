import { DialogContent  } from "@mui/material";
import { FC} from "react";
import UserDialog from "src/components/DialogSelect/UserDialog";
import { userI } from "src/store/userSlice";
import ChannelOwnerDialog from "src/components/DialogSelect/ChannerOwnerDialog";
import ChannelSettingsDialog from "./ChannerSettingsDialog";

const ChooseDialogChildren: FC<{
  dialogName: string
  user: userI | null
  element: {}
  channel: {}
}> = ({dialogName, user, element}) => {
  return (
    <>
      <DialogContent>
        {
          dialogName == "Users"
          ? <>
              <UserDialog />
              <ChannelOwnerDialog />
            </>
          : <ChannelSettingsDialog />
        }
      </DialogContent>
    </>
  );
}

export default ChooseDialogChildren;