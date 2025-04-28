import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

export default function Sidemenu({ open, toggleDrawer }) {
  const navigate = useNavigate();

  const listOptions = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        <ListItemButton onClick={() => navigate("/")}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={() => navigate("/clientRegister")}>
          <ListItemIcon>
            <PersonAddAltOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Registro de usuario" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/statusKartBooking")}>
          <ListItemIcon>
            <CollectionsBookmarkOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Reservas del cliente" />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={() => navigate("/KartBookingForm")}>
          <ListItemIcon>
            <PostAddOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Reserva aquí" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/RackWeekly")}>
          <ListItemIcon>
            <EventOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Reservas semanales" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/Reports")}>
          <ListItemIcon>
            <EventOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Reportes de venta" />
        </ListItemButton>

      </List>
    </Box>
  );

  return (
    <div>
      <Drawer anchor={"left"} open={open} onClose={toggleDrawer(false)}>
        {listOptions()}
      </Drawer>
    </div>
  );
}
