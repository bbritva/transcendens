import { Button, ButtonProps, Typography } from "@mui/material";

function AccountButton(props: ButtonProps) {
  return (
    <Button variant={"text"} {...props} sx={{ marginRight: 'auto' }}>
      <Typography variant="body1" display="flex" alignItems="center">
        {props.children}
      </Typography>
    </Button>
  );
}

export default AccountButton;
