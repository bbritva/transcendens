import React, {ReactElement, FC, useEffect, useState} from "react";
import {Box, Typography} from "@mui/material";
import { Authorization } from "src/features/authorization/Authorization";
import { useDispatch } from "react-redux";
import { login } from 'src/store/authActions'

const AccountPage: FC<any> = (): ReactElement => {
    const [accessCode, setAccessCode] = useState('');
    const [accessState, setAccessState] = useState('');
    const dispatch = useDispatch();
    useEffect(() => {
        if (accessCode){
            console.log('Account Page!', accessCode);
            // @ts-ignore
            dispatch(login(accessCode, accessState));
        }
    }, [accessCode]);

    return (
        <Box sx={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            // display: {sm: 'flex'}
        }}>
            <Authorization text='Click to login' setCode={setAccessCode} setState={setAccessState}/>
        </Box>
    );
};

export default AccountPage;