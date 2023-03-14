import { FC } from "react";
import { userI } from "src/store/userSlice";

export interface protectedProps {
  user: userI,
  render: Function,
  fail: Function | null
}

const Protected: FC<protectedProps> = (props: protectedProps) => {
  const testUsername = sessionStorage.getItem('username');
  if (!props.user?.id && !testUsername) {
      if (props.fail) {
          return props.fail();
      }
      return null;
  }
  return props.render();
}

export default Protected;