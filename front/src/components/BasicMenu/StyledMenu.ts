import { Menu, MenuItem, MenuItemProps, MenuProps } from "@mui/material";
import { styled } from "@mui/material/styles";



export const StyledMenu = styled(Menu)<MenuProps>(
    ({ theme }) => ({
        "& .MuiPaper-root": {
            backgroundColor: theme.palette.secondary.main
        },
    })
);

export const StyledMenuItem = styled(MenuItem)<MenuItemProps>(
    ({ theme }) => ({
        color: theme.palette.primary.main
}));