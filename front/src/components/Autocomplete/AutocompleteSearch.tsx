import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import socket from 'src/services/socket';
import { StyledMenuButton } from '../NavButton/StyledNavButton';
import { useNavigate } from 'react-router-dom';
import { NameSuggestionInfoI } from 'src/pages/Chat/ChatPage';
import { InputAdornment, Typography, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function AutocompleteSearch() {
  const [value, setValue] = React.useState<string | NameSuggestionInfoI | null>(null);
  const [options, setOptions] = React.useState<NameSuggestionInfoI[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();

  socket.on("nameSuggestions", (data: NameSuggestionInfoI[]) => {
    setOptions(data);
  });

  const handleChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
    setValue(value);
}
  const handleSubmit = (event: React.SyntheticEvent<Element, Event>, value: any) => {
    if (typeof(value) === 'object'){
      navigate('/account?user=' + value.id);
    }
    setValue('');
    setOptions([]);
}

  return (
    <Autocomplete
      value={value}
      clearOnBlur={true}
      onInputChange={handleChange}
      onChange={handleSubmit}
      onInput={(event) => {
          //@ts-ignore
          const newValue = event.target.value;
          setValue(newValue);
          socket.emit("getNamesSuggestions", { targetUserName: newValue })
        }}
      filterOptions={(options, params) => {

        return options;
      }}
      id="free-solo-with-text-demo"
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.name;
      }}
      renderOption={(props, option) =>
        <li {...props}>
          <StyledMenuButton
            fullWidth
            showonxs={+true}
            onClick={() => {
              setValue('');
              navigate('/account?user=' + option.id);
          }}>
            {option.name}
          </StyledMenuButton>
        </li>}
      sx={{ width: 300, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent:'center',
      [theme.breakpoints.only("xs")]: {
        width: 150
    },
      "& #free-solo-with-text-demo": {
        color: theme.palette.secondary.main,
      },
    }}
      freeSolo
      renderInput={(params) => {
        return (
          <Typography variant="subtitle2" >
            <TextField 
            {...params}  
            variant='standard'
            color='secondary'
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color='secondary'/>
                </InputAdornment>
              ),
            }}
            />
          </Typography>
        );
      }}
    />
  );
}


