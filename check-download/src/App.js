import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ProjectInfo from './ProjectInfo';
import { checkFetchResponse } from './utils';

const base = 'https://clic.xtec.cat/projects';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(2),
    },
  },
  inputDiv: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    }
  },
  textField: {
    width: '30rem',
  },
  error: {
    color: 'red',
  }

}));

function App() {

  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [path, setPath] = useState('');
  const [project, setProject] = useState(null);

  const start = () => {
    if (path.length < 1)
      setErr('Error: heu d\'indicar un path!');
    else {
      setErr(null);
      setProject(null);
      setLoading(true);
      fetch(`${base}/${path}/project.json`)
        .then(checkFetchResponse)
        .then(response => response.json())
        .then(prj => setProject(prj))
        .catch(err => setErr(err.toString()))
        .finally(() => setLoading(false));
    }

  }

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Comprovació de la velocitat de descàrrega dels projectes de la zonaClic
        </Typography>
      <div className={classes.inputDiv}>
        <TextField className={classes.textField} label="Path del projecte a descarregar:" value={path} onChange={ev => setPath(ev.target.value)} disabled={loading || project !== null} />
        <Button variant="contained" color="primary" onClick={start} disabled={loading || project !== null}>Inicia</Button>
      </div>
      {loading &&
        <CircularProgress size={40} />
      }
      {err &&
        <Typography variant="body1" className={classes.error}>{`${err}`}</Typography>
      }
      {project &&
        <ProjectInfo {...{ base, path, project }} />
      }
    </Container>
  );
}

export default App;
