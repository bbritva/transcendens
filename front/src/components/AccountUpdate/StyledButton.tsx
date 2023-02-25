import { Button, ButtonProps, Typography } from "@mui/material";

function AccountButton(props: ButtonProps) {
  return (
    <Button variant={"text"} {...props}>
      <Typography color="primary.dark" display="flex" alignItems="center">{props.children}</Typography>
    </Button>
  );
}

export default AccountButton;
