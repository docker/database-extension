import { Avatar, SvgIcon, useMediaQuery } from "@mui/material";
import { EmptyState } from "./EmptyState";
import StorageIcon from '@mui/icons-material/Storage';
export function NoRowsOverlay() {
  // TODO: remove this as soon as the icon button colors are fixed in the design system
  const useDarkTheme = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <EmptyState
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
      image={
        <Avatar
          variant="circular"
          sx={{
            width: 56,
            height: 56,
            // FIXME: the theme mode and the colors should come from the theme but it is not currently
            //bgcolor: (theme) => useDarkTheme ? theme.palette.grey[400] : theme.palette.grey[200],
            bgcolor: useDarkTheme ? "#465C6E" : "#E1E2E6",
          }}
        >
          <StorageIcon
            fontSize="large"
            sx={{
              color: useDarkTheme ? "#ADBECB" : "#677285",
            }}
          />
        </Avatar>
      }
      title="No table selected"
      content="Select a table to view its data"
    />
  );
}
