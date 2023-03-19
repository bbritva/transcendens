import { ReactElement, FC, useState, useEffect } from "react";
import { Divider, useTheme } from "@mui/material";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable from "src/components/OneColumnTable/ChatTable";
import { RootState } from "src/store/store";
import { useStore } from "react-redux";
import ChatInput from "src/components/ChatInput/ChatInput";
import ChooseDialogChildren from "src/components/DialogSelect/ChooseDialogChildren";
import { chatStyles } from "./chatStyles";
import socket from "src/services/socket";
import { useAppDispatch } from "src/app/hooks";
import { Box } from "@mui/system";
import userMenuButtons from "src/components/BasicMenu/userMenuButtons";
import channelMenuButtons from "src/components/BasicMenu/channelMenuButtons";
import { useNavigate } from "react-router-dom";

export interface fromBackI {
  name: string;
  id: string;
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
  readonly id: number;
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
  userName: string;
}

export interface newMessageI {
  id: number | null;
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
      id: null,
      channelName: destinationChannel.name,
      sentAt: null,
      authorName: testUsername || user.user?.name || "",
      authorId: user.user.id || "",
      text: value,
    };
    socket.emit("newMessage", newMessage);
    setValue("");
  };

  // props for the oneCol table - buttons styled items
  return (
    <>
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
      </Box>

      <Box flex={4} height="70vh" marginTop={"2rem"}>
        <ChatTable
          name={"Chat"}
          loading={loading}
          messages={
            channels.find((el) => el.name === chosenChannel.name)?.messages ||
            []
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
            channels.find((el) => el.name === chosenChannel.name)?.users || []
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
