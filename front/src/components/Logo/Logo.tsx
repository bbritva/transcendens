import { Box, Grid, Link,  } from '@mui/material';
import { color } from '@mui/system';

const LogoStyles = {
}

export const GridLogo = () => {
  return (<Grid item spacing={4}>
    <Box sx={{
      width:130,
      height:130,
      backgroundColor: 'black'
    }}>
      PONG
    </Box>
  </Grid>)
}