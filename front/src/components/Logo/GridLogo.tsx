import { Box, Grid, Link, useTheme,  } from '@mui/material';
import { color } from '@mui/system';
import Typography from '@mui/material/Typography';

interface GridLogoProps {
  size: number;
}

export const GridLogo = ({size}: GridLogoProps) => {
  const theme=useTheme()
  return (
  <Grid item>
    <Box 
      display={'flex'}
      alignItems={'center'}
      sx={{
        width: size*1.5,
        height: '170%',
        backgroundColor: theme.palette.primary.dark
      }}
    >
      <Typography variant='h3'>
        PONG
      </Typography>
    </Box>
  </Grid>)
}