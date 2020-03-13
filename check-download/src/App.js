import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ProjectInfo from './ProjectInfo';
import { checkFetchResponse } from './utils';

export const DEFAULT_BASE = 'https://clic.xtec.cat/projects';

function App() {

  const [base, setBase] = useState(DEFAULT_BASE);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [path, setPath] = useState('');
  const [project, setProject] = useState(null);
  const [initialTime, setInitialTime] = useState(0);

  const start = () => {
    if (path.length < 1) {
      setErr('Error: heu d\'indicar un path!');
    }
    else {
      setErr(null);
      setProject(null);
      setLoading(true);
      const startTime = Date.now();
      fetch(`${base}/${path}/project.json`)
        .then(checkFetchResponse)
        .then(response => response.json())
        .then(prj => {
          setInitialTime(Date.now() - startTime);
          setProject(prj);
        })
        .catch(err => setErr(err.toString()))
        .finally(() => setLoading(false));
    }

  }

  return (
    <Container maxWidth="lg" className="root">
      <Typography variant="h4" component="h1" gutterBottom className="title">
        Comprovació de la velocitat de descàrrega dels projectes de la zonaClic
      </Typography>
      <div className="inputDiv">
        <TextField className="textField" label="URL de base:" value={base} onChange={ev => setBase(ev.target.value.replace(/\/+$/, ''))} disabled={loading || project !== null} />
        <TextField className="textField" label="Path del projecte a descarregar:" value={path} onChange={ev => setPath(ev.target.value)} disabled={loading || project !== null} />
        <Button variant="contained" color="primary" onClick={start} disabled={loading || project !== null}>Inicia</Button>
      </div>
      {loading &&
        <CircularProgress size={40} />
      }
      {err &&
        <Typography variant="body1" className="error">{`${err}`}</Typography>
      }
      {project &&
        <ProjectInfo {...{ base, path, project, initialTime }} />
      }
    </Container>
  );
}

export default App;
