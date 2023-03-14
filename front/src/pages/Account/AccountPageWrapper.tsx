import { FC, ReactElement, useEffect, useState } from "react";
import AccountPage from "./AccountPage";
import { UserInfoPublic } from "src/store/chatSlice";
import { useSearchParams } from "react-router-dom";
import userService from "src/services/user.service";

export interface extUserState {
  status: string,
  id: number,
  user: UserInfoPublic
}

const AccountPageWrapper: FC<any> = (): ReactElement => {
  const [extUser, setExtUser] = useState<extUserState>({status: 'idle', id: 0, user: {} as UserInfoPublic});
  let [searchParams, setSearchParams] = useSearchParams();

  let newUser = searchParams.get("user");

  useEffect(() => {
    console.log(extUser);
    let id = parseInt(newUser || '');
    if (isNaN(id))
      return;
    else if (extUser.status !== 'idle' && id === extUser.id)
      return;
    let abortController = new AbortController();
    async function getExtUser(id: number) {
      let response = userService.getById(id, abortController);
      if (!abortController.signal.aborted) {
        await response
          .then((userData) => {
            console.log(userData);
          })
          .catch((error) => {
            console.log({error});
          })
      }
    }

    if (id > 0) {
      setExtUser({status: 'loading', id: id, user:{} as UserInfoPublic});
      getExtUser(id);
    }

    return () => {
      abortController.abort();
    };
  }, [newUser]);

  return <AccountPage key={extUser.id} extUser={extUser}/>;
}

export default AccountPageWrapper;