import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function LineupHelp() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Lineup Help
      </Typography>
      <Typography variant="body1" paragraph>
        The pitch is a visual representation of the soccer field, with circles
        indicating player positions.
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        What you can do:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Choose a formation" secondary="Selects that formation for the pitch view." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Click on a position" secondary="Selects that position for substitution or player movement." />
        </ListItem>
        <ListItem>
          <ListItemText primary="View assigned player" secondary="See the name and number above the circle for each assigned player." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom>
        Using Formation Selector:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Select a Formation" secondary="Choose a formation from the dropdown menu to set up your team's lineup." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom>
        Information Displayed:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Positions" secondary="Circles show position on the field, labeled with abbreviations (e.g., LW, CM)." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Players" secondary="Name and number are shown above the circle if a player is assigned." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Highlighting" secondary="Selected position will have a red outline." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom>
        Clicking on Positions:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Select a position" secondary="Clicking selects the position, enabling:" />
        </ListItem>
          <ListItem>
            <ListItemText primary="Substituting a player" secondary="Select a player from the bench to place in the selected position." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Moving a player" secondary="Select another position on the pitch to swap players." />
          </ListItem>
        <ListItem>
          <ListItemText primary="Clicking a Player (Name/Number)" secondary="Also selects the position and filters the Bench view to show only preferred players for that position." />
        </ListItem>
      </List>
      <Typography variant="subtitle1" gutterBottom>
        Additional Feature:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Preferred Players" secondary="Selecting a player limits the Bench view to only preferred players for that position." />
        </ListItem>
      </List>
    </Box>
  );
}