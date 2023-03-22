import { Box, Typography, useTheme } from '@mui/material'

function HomePage() {
  const theme = useTheme();

  return (
    <Box
      marginTop={'15vh'}
      marginRight={'35vw'}
      display={'table-column'}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'center'
      }}>
      <Typography variant="h4" color={'lightsalmon'}>
        Ultimate 42
      </Typography>
      <Typography variant="h2" color={theme.palette.secondary.main}>
        Pong game
      </Typography>
    </Box>

  );
}

export default HomePage;