import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import socket from 'src/services/socket';

const filter = createFilterOptions<FilmOptionType>();



export default function AutocompleteSearch() {
  const [value, setValue] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<string[]>([]);
  function nickSearch(this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    setValue(event.currentTarget.value);
    socket.emit("getNamesSuggestions", { targetUserName: event.currentTarget.value })
  }

  socket.on("nameSuggestions", (data: string[]) => {
    console.log("nameSuggestions", data);
    setOptions(data);

  });

  return (
    <Autocomplete
      value={value}
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
        return option;
        // Value selected with enter, right from the input
        // if (typeof option === 'string') {
        //   return option;
        // }
        // // Add "xxx" option created dynamically
        // if (option.inputValue) {
        //   return option.inputValue;
        // }
        // // Regular option
        // return option.title;
      }}
      renderOption={(props, option) => <li {...props}>{option}</li>}
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

