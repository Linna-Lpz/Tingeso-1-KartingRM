import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import HomeIcon from "@mui/icons-material/Home";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navegate() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleGestionClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (route) => {
    navigate(route);
    handleClose();
  };

  return (
    <Box sx={{ flexGrow: 1, maxWidth: "100%" }}>
      <AppBar position="static">
        <Toolbar
          sx={{
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{ 
              fontSize: "1rem",
              fontWeight: "medium"
            }}
          >
            Inicio
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate("/")}
            sx={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              letterSpacing: "1px",
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            Karting RM
          </Button>

          <Box sx={{ display: "flex", gap: 1 }}>

            <Button
              color="inherit"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/statusKartBooking")}
              sx={{ 
                fontSize: "1rem",
                fontWeight: "medium"
              }}
            >
              Revisa tus reservas
            </Button>

            <Button
              color="inherit"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate("/clientRegister")}
              sx={{ 
                fontSize: "1rem",
                fontWeight: "medium"
              }}
            >
              Registro
            </Button>

            <Button
              color="inherit"
              startIcon={<ViewKanbanIcon />}
              endIcon={<ArrowDropDownIcon />}
              onClick={handleGestionClick}
              sx={{ 
                fontSize: "1rem",
                fontWeight: "medium"
              }}
            >
              Gestión
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'gestión-button',
              }}
            >
              <MenuItem onClick={() => handleMenuItemClick("/reports")}>
                Reporte de ventas
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick("/rackWeekly")}>
                Rack semanal
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
