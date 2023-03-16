import { FC, ReactElement, useEffect, useState } from "react";
import AccountPage from "./AccountPage";
import { UserInfoPublic } from "src/store/chatSlice";
import { useSearchParams } from "react-router-dom";
import userService from "src/services/user.service";
import { selectUser, userI } from "src/store/userSlice";
import { useSelector } from "react-redux";

export interface extUserState {
  status: string,
  id: number,
  user: UserInfoPublic | userI
}

const AccountPageWrapper: FC<any> = (): ReactElement => {
  const { user } = useSelector(selectUser);
  const [extUser, setExtUser] = useState<extUserState>({status: 'idle', id: 0, user: user || {} as UserInfoPublic});
  let [searchParams, setSearchParams] = useSearchParams();
  const [variant, setVariant] = useState<boolean>(true);

  let newUser = searchParams.get("user");

  useEffect(() => {
    let id = parseInt(newUser || '');
    if (isNaN(id)){
      setVariant(true);
      setExtUser({status: 'idle', id: 0, user: user || {} as UserInfoPublic});
      return;
    }
    else if (extUser.status !== 'idle' && id === extUser.id){
      return;
    }
    let abortController = new AbortController();

    async function getExtUser(id: number) {
      let response = userService.getById(id, abortController);
      if (!abortController.signal.aborted) {
        await response
          .then((userData) => {
            setExtUser({status: 'succeed', id: id, user: userData.data as UserInfoPublic});
          })
          .catch((error) => {
            console.log({error});
          })
      }
    }

    if (id > 0) {
      setVariant(false);
      setExtUser({status: 'loading', id: id, user:{} as UserInfoPublic});
      getExtUser(id);
    }

    return () => {
      abortController.abort();
    };
  }, [newUser]);

  return <AccountPage key={extUser.id} extUser={extUser} variant={variant}/>;
}

export default AccountPageWrapper;