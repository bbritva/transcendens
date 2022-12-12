import { Box, Grid, Link,  } from '@mui/material';
import { color } from '@mui/system';
import Typography from '@mui/material/Typography';

interface GridLogoProps {
  size: number;
}

export const GridLogo = ({size}: GridLogoProps) => {
  return (
  <Grid item spacing={4}>
    <Box 
      display={'flex'}
      alignItems={'center'}
      sx={{
        width: size*1.5,
        height: '170%',
        backgroundColor: 'black',
      }}
    >
      <Typography variant='h3'>
        PONG
      </Typography>
    </Box>
  </Grid>)
}