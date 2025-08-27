import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useMediaQuery, IconButton, Tooltip } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import RosterTab from './components/RosterTab';
import LineupTab from './components/LineupTab';
import MatchTab from './components/MatchTab';
import HelpTab from './components/HelpTab';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'dark'
                        ? {
                            background: {
                                default: '#121212', // Dark background
                                paper: '#1e1e1e', // Darker paper
                            },
                        }
                        : {
                            background: {
                                default: '#f5f5f5', // Light background
                                paper: '#ffffff', // Lighter paper
                            },
                        }),
                },
            }),
        [mode],
    );
    const [tab, setTab] = React.useState<number>(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const currentTheme = useTheme();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary', pb: `${8}px` }}>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper', width: '100%' }}>
                    <Box sx={{ margin: '0 auto', padding: (theme) => theme.spacing(0, 2) , display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example" centered sx={{ width: '100%' }}>
                            <Tab label="Roster" />
                            <Tab label="Lineup" />
                            <Tab label="Match" />
                            <Tab label="Help" />
                        </Tabs>
                        <Tooltip title="Toggle light/dark mode">
                            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                                {currentTheme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Box sx={{ margin: '0 auto', py: `${6}px`, spacing: 6 }}>
                    {tab === 0 && (
                        <RosterTab />
                    )}
                    {tab === 1 && (
                        <LineupTab />
                    )}
                    {tab === 2 && (
                        <MatchTab />
                    )}
                    {tab === 3 && (
                        <HelpTab />
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;