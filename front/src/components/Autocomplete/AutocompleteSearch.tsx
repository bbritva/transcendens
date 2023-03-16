import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import socket from 'src/services/socket';
import { StyledMenuButton } from '../NavButton/StyledNavButton';
import { useNavigate } from 'react-router-dom';
import { NameSuggestionInfoI } from 'src/pages/Chat/ChatPage';
import { Typography, useTheme } from '@mui/material';

export default function AutocompleteSearch() {
  const [value, setValue] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<NameSuggestionInfoI[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();

  socket.on("nameSuggestions", (data: NameSuggestionInfoI[]) => {
    setOptions(data);
  });

  const labelStyle = {
      color: theme.palette.secondary.main, 
    };

  return (
    <Autocomplete
      value={value}
      clearOnBlur={true}
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
      backgroundColor: theme.palette.primary.main }}
      freeSolo
      renderInput={(params) => {
        return <Typography variant="subtitle2">
        <TextField 
        {...params} label="Search user..." style={labelStyle}
        variant='standard'
        sx={{
          fieldset: {
            borderColor: theme.palette.secondary.main,
          },
          input: {
            color: theme.palette.secondary.main,
          }
        }}
        />
        </Typography>;
      }}
    />
  );
}

interface FilmOptionType {
  inputValue?: string;
  title: string;
  year?: number;
}

