import { DialogContent } from "@mui/material";
import { FC } from "react";
import UserDialog from "src/components/DialogSelect/UserDialog";
import { userI } from "src/store/userSlice";
import ChannelOwnerDialog from "src/components/DialogSelect/ChannerOwnerDialog";
import ChannelSettingsDialog from "./ChannerSettingsDialog";
import { fromBackI } from "src/pages/Chat/ChatPage";

export interface dialogProps {
  dialogName: string
  user: userI | null
  element: fromBackI
  channel: {}
  setDestination: Function
  setOpen?: Function
}

const ChooseDialogChildren: FC<dialogProps> = (props: dialogProps) => {
  return (
    <>
      <DialogContent>
        {
          props.dialogName == "Users"
            ? <>
                <UserDialog {...props} />
                <ChannelOwnerDialog />
              </>
            : <ChannelSettingsDialog />
        }
      </DialogContent>
    </>
  );
}

export default ChooseDialogChildren;