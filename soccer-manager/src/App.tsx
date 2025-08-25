import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import RosterTab from './components/RosterTab';
import LineupTab from './components/LineupTab';
import MatchTab from './components/MatchTab';
import { Box, Tabs, Tab } from '@mui/material';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#10b981', // Your primary color
          },
          background: {
            default: prefersDarkMode ? '#0a0a0a' : '#fff',
            paper: prefersDarkMode ? '#171717' : '#fff',
          },
          text: {
            primary: prefersDarkMode ? '#f5f5f5' : '#000',
            secondary: prefersDarkMode ? '#a3a3a3' : '#666',
          },
        },
      }),
    [prefersDarkMode],
  );
  const [tab, setTab] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary', pb: `${8}px` }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
          <Box sx={{ maxWidth: '1280px', margin: '0 auto', padding: (theme) => theme.spacing(0, 2) }}>
            <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example" centered>
              <Tab label="Roster" />
              <Tab label="Lineup" />
              <Tab label="Match" />
            </Tabs>
          </Box>
        </Box>
        <Box sx={{ maxWidth: '1280px', margin: '0 auto', py: `${6}px`, spacing: 6 }}>
          {tab === 0 && (
            <RosterTab onSendToLineup={() => handleChange(new Event(''), 1)} />
          )}
          {tab === 1 && (
            <LineupTab />
          )}
          {tab === 2 && (
            <MatchTab />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

