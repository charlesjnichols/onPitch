import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function RosterHelp() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Roster Help
      </Typography>
      <Typography variant="body1" paragraph>
        The roster displays all players and their information, including preferred positions.
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        What you can do:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Add/Remove Players" secondary="Use the Import and Export features to manage your roster." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom>
        Information Displayed:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Name" secondary="The name of the player." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Number" secondary="The jersey number of the player." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Preferred Positions" secondary="The preferred positions for the player, separated by pipes (e.g., LW|CM)." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom>
        Adding/Removing Players:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Import CSV" secondary="Upload a CSV file containing player data to add or update players in your roster." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Export CSV" secondary="Download the current state of your roster as a CSV file for backup or sharing." />
        </ListItem>
      </List>
    </Box>
  );
}