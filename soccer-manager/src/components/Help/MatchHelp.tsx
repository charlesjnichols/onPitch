import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function MatchHelp() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Match Help
      </Typography>
      <Typography variant="body1" paragraph>
        The Match panel allows you to control the match clock, manage
        substitutions, and track player statistics.
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Key Features:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Clock Controls:" secondary="Start, stop, and reset the match clock." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Player Management:" secondary="View players on the field and on the bench." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Substitution Tracking:" secondary="Track substitutions made during the match." />
        </ListItem>
      </List>

      <Typography variant="subtitle1" gutterBottom>
        Clock Controls:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Start:" secondary="Starts the match clock." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Stop:" secondary="Pauses the match clock." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Reset:" secondary="Resets the match clock to zero." />
        </ListItem>
      </List>

      <Typography variant="subtitle1" gutterBottom>
        Player Information:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="On Field Players:" secondary="Displays the players currently on the field." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Bench Players:" secondary="Displays the players currently on the bench." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Minutes:" secondary="The number of minutes each player has played." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Preferred Positions:" secondary="The preferred positions of each player." />
        </ListItem>
      </List>

      <Typography variant="subtitle1" gutterBottom>
        Substitutions:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Tracking:" secondary="Explains how substitutions are recorded and managed." />
        </ListItem>
      </List>
    </Box>
  );
}