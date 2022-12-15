import { Alert } from "@mui/material";
import React, {ReactElement, FC, useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearMessage, selectMessage } from "src/store/messageSlice";


const Allerts: FC<any> = (): ReactElement => {
  const message = useSelector(selectMessage);
  const dispath = useDispatch();
  console.log(message)
  return (
    <>
      {
        message.message && 
        <Alert 
          onClose={() => {dispath(clearMessage())}}
          severity="warning"
        >
          {`${message.message}`}
        </Alert>
      }
    </>
  );
};

export default Allerts;