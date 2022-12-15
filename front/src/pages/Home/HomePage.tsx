import {Box, Typography} from '@mui/material'

function HomePage() {
  return (
    <Box sx={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'center'
    }}>
        <Typography variant="h4" color={'lightsalmon'}>
          Ultimate 42
        </Typography>
        <Typography variant="h2" color={'lightgoldenrodyellow'}>
          Most Popular
        </Typography>
    </Box>
  );
}

export default HomePage;