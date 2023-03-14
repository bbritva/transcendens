import { Button, ButtonProps, Typography, useTheme } from "@mui/material";

function AccountButton(props: ButtonProps) {
  const theme = useTheme();
  return (
    <Button
      fullWidth
      variant={"text"}
      {...props}
      sx={{
        justifyContent: "flex-start",
        "&:hover": {
          backgroundColor: theme.palette.primary.light,
        },
      }}
    >
      <Typography variant="body1" display="flex" alignItems="center">
        {props.children}
      </Typography>
    </Button>
  );
}

export default AccountButton;
