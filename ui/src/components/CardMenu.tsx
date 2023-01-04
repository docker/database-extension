import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider } from "@mui/material";
import { Delete, Edit, Stop } from "@mui/icons-material";
import EmptyConfirmationDialog from "./DeleteDBDialog";
import { IDBConnection } from "../utils/types";

const ITEM_HEIGHT = 48;

export function CardMenu({ database }: { database: IDBConnection }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          }}
        >
          <MenuItem key={"Edit Database"} onClick={handleClose}>
            <Edit fontSize="small" sx={{ marginRight: 1 }} />
            {"Edit Database"}
          </MenuItem>
          <MenuItem key={"Delete Database"} onClick={() => setDialogOpen(true)}>
            <Delete fontSize="small" sx={{ marginRight: 1 }} />
            {"Delete Database"}
          </MenuItem>
          <Divider />
          <MenuItem key={"Stop Container"} onClick={handleClose}>
            <Stop fontSize="small" sx={{ marginRight: 1 }} />
            {"Stop Container"}
          </MenuItem>
        </Menu>
      </div>
      <EmptyConfirmationDialog open={dialogOpen} containerName={database.name} onClose={() => setDialogOpen(false)} />
    </>
  );
}
