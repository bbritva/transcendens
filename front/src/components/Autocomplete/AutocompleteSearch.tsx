import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import socket from 'src/services/socket';
import { StyledMenuButton } from '../NavButton/StyledNavButton';
import { useNavigate } from 'react-router-dom';
import { NameSuggestionInfoI } from 'src/pages/Chat/ChatPage';

const filter = createFilterOptions<FilmOptionType>();



export default function AutocompleteSearch() {
  const [value, setValue] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<NameSuggestionInfoI[]>([]);
  const navigate = useNavigate();

  socket.on("nameSuggestions", (data: NameSuggestionInfoI[]) => {
    setOptions(data);
  });

  return (
    <Autocomplete
      value={value}
      clearOnBlur={true}
      onInput={(event) => {
          //@ts-ignore
          const newValue = event.target.value;
          setValue(newValue);
          socket.emit("getNamesSuggestions", { targetUserName: newValue })
          // if (typeof newValue === 'string') {
          //   setValue(
          //     newValue,
          //   );
          // } else if (newValue) {
          //   // Create a new value from the user input
          //   setValue(
          //     newValue,
          //   );
          // } else {
          //   setValue(newValue);
          // }
        }}
      filterOptions={(options, params) => {
        // const filtered = filter(options, params);

        // const { inputValue } = params;
        // // Suggest the creation of a new value
        // const isExisting = options.some((option) => inputValue === option.title);
        // if (inputValue !== '' && !isExisting) {
        //   filtered.push({
        //     inputValue,
        //     title: `Add "${inputValue}"`,
        //   });
        // }

        return options;
      }}
      id="free-solo-with-text-demo"
      options={options}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        // if (option.inputValue) {
        //   return option.inputValue;
        // }
        // Regular option
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
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Free solo with text demo" />
      )}
    />
  );
}

interface FilmOptionType {
  inputValue?: string;
  title: string;
  year?: number;
}

