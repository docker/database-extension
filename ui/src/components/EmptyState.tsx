import React from "react";
import { Stack, Typography } from "@mui/material";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles/createTheme";

interface Props {
  image: React.ReactNode;
  title: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function EmptyState({ image, title, content, sx, actions }: Props) {
  return (
    <Stack alignItems="center" sx={sx} gap={2}>
      {image}
      <Stack alignItems="center" gap={1}>
        <Typography textAlign="center" component="h3" variant="h3">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {content}
        </Typography>
      </Stack>
      {actions}
    </Stack>
  );
}
