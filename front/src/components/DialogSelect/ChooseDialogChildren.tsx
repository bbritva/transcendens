import { DialogContent, DialogTitle, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";
import UserDialog from "./UserDialog";

const ChooseDialogChildren: FC<{
  name: string
  element: {}
}> = ({name, element}) => {
  return (
    <>
      <DialogTitle>{name}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {
            name == "Users"
            ? <UserDialog />
            : <Typography>{JSON.stringify(element)}</Typography>
          }
          </Box>
        </DialogContent>
    </>
  );
}

export default ChooseDialogChildren;