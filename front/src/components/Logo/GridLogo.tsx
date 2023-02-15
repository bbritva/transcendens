import { Box, Grid, Link, useTheme,  } from '@mui/material';
import { color } from '@mui/system';
import Typography from '@mui/material/Typography';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';


export const GridLogo = () => {
  const theme=useTheme()
  return (
    <Box 
      marginLeft={'2rem'}
      display={'flex'}
      alignItems='center'
      gap={1}
      sx={{
        backgroundColor: theme.palette.primary.main
      }}
    >
      <Typography variant='h3' color="secondary">
        PONG
      </Typography>
      <SportsCricketIcon color="secondary" fontSize="large" />
    </Box>);
}