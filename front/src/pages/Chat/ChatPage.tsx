import { ReactElement, FC, useState, useEffect } from "react";
import { Button, Divider, TextField, Typography, useTheme } from "@mui/material";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable from "src/components/OneColumnTable/ChatTable";
import { RootState } from "src/store/store";
import { useSelector, useStore } from "react-redux";
import ChatInput from "src/components/ChatInput/ChatInput";
import ChooseDialogChildren from "src/components/DialogSelect/ChooseDialogChildren";
import { chatStyles } from "./chatStyles";
import socket from "src/services/socket";
import { useAppDispatch } from "src/app/hooks";
import { Box } from "@mui/system";
import userMenuButtons from "src/components/BasicMenu/userMenuButtons";
import channelMenuButtons from "src/components/BasicMenu/channelMenuButtons";
import { useNavigate } from "react-router-dom";
import { selectBanned } from "src/store/chatSlice";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { StyledMenu, StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { EventI } from "src/components/DialogSelect/ChannerSettingsDialog";

interface idI {
  id: string
}

export interface fromBackI extends idI{
  name: string;
  hasNewMessages: boolean;
  messages: newMessageI[];
  connected: boolean;
  data: any;
}

export interface NameSuggestionInfoI {
  readonly id: number;
  readonly name: string;
}

export interface UserStatusI {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

export interface userFromBackI extends fromBackI {}

export interface channelFromBackI extends fromBackI {
  users: userFromBackI[];
  hasPasswrod: boolean;
  isPrivate: boolean;
}

export interface userInChannelMovementI {
  channelName: string;
  targetUserName: string;
}

export interface newMessageI extends idI{
  channelName: string;
  sentAt: string | null;
  authorName: string;
  authorId: string;
  text: string;
}

export interface ChatPageProps {
  channels: channelFromBackI[];
  setChannels: Function;
}

const ChatPage: FC<ChatPageProps> = ({
  channels,
  setChannels,
}): ReactElement => {
  const [page, setPage] = useState(0);
  const [value, setValue] = useState("");
  const [chosenChannel, setChosenChannel] = useState({} as channelFromBackI);
  const [loading, setLoading] = useState(false);
  const [chosenUser, setChosenUser] = useState<userFromBackI>(
    {} as userFromBackI
  );
  const [destination, setDestination] = useState<[string, fromBackI]>([
    "",
    {} as fromBackI,
  ]);
  const navigate = useNavigate();
  const { getState } = useStore();
  const { user, auth } = getState() as RootState;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const testUsername = sessionStorage.getItem("username");
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [openChannelsDialog, setOpenChannelsDialog] = useState(false);
  const banned = useSelector(selectBanned);

  const [open, setOpen] = useState<boolean>(false);
  const [channelName, setChannelName] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const handleClose = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const [destTaper, destObject] = destination;
    if (destTaper === "Channels") {
      socket.emit(destObject.name, destObject.data);
      setChosenChannel(destObject as channelFromBackI);
    } else if (destTaper === "Users") {
      socket.emit(destObject.name, destObject.data);
      setChosenChannel(destObject.data);
    }
  }, [destination]);

  chatStyles.scrollStyle["&::-webkit-scrollbar-thumb"].backgroundColor =
    theme.palette.primary.light;

  const onSubmit = () => {
    const [taper, destinationChannel] = destination;
    if (!destinationChannel.name || !value || value == "\n") {
      setValue("");
      return;
    }
    const newMessage: newMessageI = {
      id: '',
      channelName: destinationChannel.name,
      sentAt: null,
      authorName: testUsername || user.user?.name || "",
      authorId: user.user.id || "",
      text: value,
    };
    socket.emit("newMessage", newMessage);
    setValue("");
  };

  const filterBannedByElemIf = (elem: idI) => {
    for (let i = 0; i < banned.length; i++){
      if (banned[i].id === elem.id)
        return false;
    }
    return true;
  }

  function filterBannedUsers(users: userFromBackI[]){
    return users.filter(filterBannedByElemIf)
  }

  function filterBannedMessages(messages: newMessageI[]){
    return messages.filter((elem) => {
      for (let i = 0; i < banned.length; i++){
        if (banned[i].id === elem.authorId)
          return false;
      }
      return true;
    })
  }

  function handleContextMenu (event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 3,
          mouseY: event.clientY + 3,
        }
        : null,
    );
  }

  const contextMenuButtons = [
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => setOpen(true),
        children: 'Create channel',
        key: 1
      }
    },
  ]
  // props for the oneCol table - buttons styled items
  return (
    <>
      <DialogSelect options={ {} } open={open} setOpen={(value: boolean) => {
          setOpen(value);
          setTimeout(() => setChannelName(''), 200);
        }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="0px"
        >
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="new name"
              type="text"
              variant="standard"
              value={channelName}
              onChange={(event) => {
                setChannelName(event.target.value);
              }}
            />
            <Button
              fullWidth
              sx={{
                justifyContent: "flex-start",
              }}
              onClick={() => {
                const event: EventI = {
                  name: "",
                  data: { channelName: '', newName: value },
                };
              }}
            >
              <Typography variant="subtitle1">Submit</Typography>
            </Button>
        </Box>
      </DialogSelect>
      <Box
        flex={1}
        marginTop={"2rem"}
        marginLeft={"2rem"}
        marginRight={"1rem"}
        marginBottom={"2rem"}
        sx={{ display: { xs: "none", sm: "none", md: "block" } }}
      >
        <OneColumnTable
          taper="CHANNELS"
          user={user.user}
          loading={loading}
          elements={channels}
          buttons={channelMenuButtons(
            setOpenChannelsDialog,
            setDestination,
            chosenChannel
          )}
          openDialog={openChannelsDialog}
          setOpenDialog={setOpenChannelsDialog}
          chatStyles={chatStyles}
          selectedElement={chosenChannel}
          setElement={(channel: channelFromBackI) => {
            setDestination(["Channels", channel]);
          }}
          handleRightClick={handleContextMenu}
          dialogChildren={
            <ChooseDialogChildren
              dialogName="Channels"
              user={user.user}
              element={chosenChannel}
              channel={chosenChannel}
              setDestination={setDestination}
              setOpen={setOpenChannelsDialog}
            />
          }
        />
        <StyledMenu
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
          id="basic-menu"
          open={contextMenu !== null}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {contextMenuButtons.map((element) => {
            const MButton = element.component;
            //@ts-ignore
            return (<MButton {...element.compProps} onClick={() => { element.compProps.onClick(); handleClose(); }} />
            );
          })}
        </StyledMenu>
      </Box>

      <Box flex={4} height="70vh" marginTop={"2rem"}>
        <ChatTable
          name={"Chat"}
          loading={loading}
          messages={
            filterBannedMessages(channels.find((el) => el.name === chosenChannel.name)?.messages || [])
          }
          socket={socket}
          chatStyles={chatStyles}
          user={user.user}
        />
        <Divider />
        <Box>
          <ChatInput
            chatStyles={chatStyles}
            value={value}
            setValue={setValue}
            onSubmit={onSubmit}
          />
        </Box>
      </Box>

      <Box
        flex={1}
        marginTop={"2rem"}
        marginLeft={"1rem"}
        marginRight={"2rem"}
        marginBottom={"2rem"}
        sx={{ display: { xs: "none", sm: "block", md: "block" } }}
      >
        <OneColumnTable
          taper="USERS"
          user={user.user}
          loading={loading}
          elements={
            filterBannedUsers(channels.find((el) => el.name === chosenChannel.name)?.users || [])
          }
          buttons={userMenuButtons(setOpenUsersDialog, setDestination, chosenUser, navigate)}
          openDialog={openUsersDialog}
          setOpenDialog={setOpenUsersDialog}
          chatStyles={chatStyles}
          selectedElement={chosenUser}
          setElement={setChosenUser}
          dialogChildren={
            <ChooseDialogChildren
              dialogName="Users"
              user={user.user}
              element={chosenUser}
              channel={chosenChannel}
              setDestination={setDestination}
              setOpen={setOpenUsersDialog}
            />
          }
        />
      </Box>
    </>
  );
};

export default ChatPage;
