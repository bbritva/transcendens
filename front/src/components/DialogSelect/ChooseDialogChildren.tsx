import { DialogContent } from "@mui/material";
import { FC } from "react";
import { userI } from "src/store/userSlice";
import ChannelOwnerDialog from "src/components/DialogSelect/ChannerOwnerDialog";
import ChannelSettingsDialog from "./ChannerSettingsDialog";
import { channelFromBackI, fromBackI } from "src/pages/Chat/ChatPage";

export interface dialogProps {
  dialogName: string
  user: userI | null
  element: fromBackI
  channel: channelFromBackI
  setDestination: Function
  setOpen?: Function
}

const ChooseDialogChildren: FC<dialogProps> = (props: dialogProps) => {
  return (
    <>
      <DialogContent>
        {
          props.dialogName == "Users"
            ? <ChannelOwnerDialog {...props}/>
            : <ChannelSettingsDialog {...props}/>
        }
      </DialogContent>
    </>
  );
}

export default ChooseDialogChildren;