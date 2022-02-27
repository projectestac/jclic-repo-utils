import { blue, deepPurple } from '@mui/material/colors';
import { createTheme, adaptV4Theme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme(adaptV4Theme({
  palette: {
    primary: blue,
    secondary: deepPurple,
  },
}));

export default theme;