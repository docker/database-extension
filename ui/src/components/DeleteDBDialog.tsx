import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { createDockerDesktopClient } from "@docker/extension-api-client";

const ddClient = createDockerDesktopClient();

interface Props {
  open: boolean;
  containerName: string;
  onClose(): void;
}

export default function EmptyConfirmationDialog({ ...props }: Props) {
  const deleteDB = () => {
    ddClient.docker.cli.exec('rm', ['-f', props.containerName]);
    props.onClose();
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Delete Database</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The database <strong>{props.containerName}</strong> will be
          deleted. This action cannot be undone. Are you sure?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => {
            props.onClose();
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={deleteDB}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
