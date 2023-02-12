import { Box, Grid, Link, useTheme,  } from '@mui/material';
import { color } from '@mui/system';
import Typography from '@mui/material/Typography';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';

interface GridLogoProps {
  size: number;
}

export const GridLogo = ({size}: GridLogoProps) => {
  const theme=useTheme()
  return (
    <Box 
      display={'flex'}
      alignItems='center'
      gap={1}
      sx={{
        width: size*1.5,
        height: '170%',
        backgroundColor: theme.palette.primary.main
      }}
    >
      <Typography variant='h3' color="secondary">
        PONG
      </Typography>
      <SportsCricketIcon color="secondary" fontSize="large" />
    </Box>);
}