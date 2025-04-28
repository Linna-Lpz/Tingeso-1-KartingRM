import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "./Menu";
import { useState } from "react";

export default function Navegate() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    setOpen(open);
  };

  return (
    <Box sx={{ flexGrow: 1 , maxWidth: "100%" }}>
      <AppBar position="static">
        <Toolbar sx={{ 
          background: "linear-gradient(90deg, #FF8C00 0%, #FFA500 100%)",
          padding: "8px 16px"
        }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
            <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: "500" }}>
              Menú
            </Typography>
          </IconButton>

          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: "bold",
              letterSpacing: "1px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
            }}
          >
          </Typography>
        </Toolbar>
      </AppBar>

      <Menu open={open} toggleDrawer={toggleDrawer}></Menu>
    </Box>
  );
}
