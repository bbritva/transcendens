import { FC } from "react";

export interface protectedProps {
  user: {} | null,
  render: Function,
  fail: Function | null
}

const Protected: FC<protectedProps> = (props: protectedProps) => {
  const testUsername = sessionStorage.getItem('username');
  if (!props.user || !testUsername) {
      if (props.fail) {
          return props.fail();
      }
      return null;
  }
  return props.render();
}

export default Protected;