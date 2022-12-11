import React, {ReactElement, FC} from "react";
import {Box, Typography} from "@mui/material";

const ChatPage: FC<any> = (): ReactElement => {
    return (
        <Box sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Typography variant="h3">ChatPage</Typography>
        </Box>
    );
};

export default ChatPage;