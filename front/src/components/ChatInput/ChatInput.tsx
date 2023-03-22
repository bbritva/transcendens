import { ReactElement, FC } from "react";
import { IconButton, InputAdornment, OutlinedInput, useTheme } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { chatStylesI } from "src/pages/Chat/chatStyles";


const ChatInput: FC<{
    chatStyles: chatStylesI,
    value: string,
    setValue: Function,
    onSubmit: () => void,
}> = ({
  chatStyles,
  value,
  setValue,
  onSubmit,
}): ReactElement => {
  const theme = useTheme();
  return (
    <OutlinedInput
      id="outlined-adornment-enter"
      onChange={(e) => setValue(e.target.value)}
      onKeyUp={(e) => {
        if (e.key === 'Enter')
          onSubmit();
      }}
      value={value}
      type={'text'}
      fullWidth
      multiline
      maxRows={'3'}
      sx={{
        ".MuiOutlinedInput-notchedOutline": {
          ...chatStyles.borderStyle
        },
        ".MuiInputBase-input" :{
          overflow: 'hidden',
        },
        color: theme.palette.secondary.main
      }}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            onClick={onSubmit}
            edge="end"
          >
            <SendIcon sx={{
              color:theme.palette.primary.light,
            }}/>
          </IconButton>
        </InputAdornment>
      }
    />
  );
};

export default ChatInput;