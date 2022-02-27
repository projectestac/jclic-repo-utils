import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ProjectInfo from './ProjectInfo';
import { checkFetchResponse } from './utils';
import projectsList from './projects.json';
import pk from '../package.json';
const { version, name } = pk;


export const DEFAULT_BASE = 'https://clic.xtec.cat/projects';

function App() {

  const [base, setBase] = useState(DEFAULT_BASE);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [path, setPath] = useState('');
  const [project, setProject] = useState(null);
  const [initialTime, setInitialTime] = useState(0);

  const filterOptions = createFilterOptions({
    limit: 100,
  });

  const start = () => {
    if (path.length < 1) {
      setErr('Error: heu d\'indicar un path!');
    }
    else {
      setErr(null);
      setProject(null);
      setLoading(true);
      const startTime = Date.now();
      fetch(`${base}/${path}/project.json`,
        {
          cache: 'no-store',
          credentials: 'same-origin',
        })
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
      <main>
        <Typography variant="h4" component="h1" gutterBottom className="title">
          Comprovació de la velocitat de descàrrega dels projectes de la zonaClic
        </Typography>
        <div className="inputDiv">
          <TextField className="textField" label="URL de base:" value={base} onChange={ev => setBase(ev.target.value.replace(/\/+$/, ''))} disabled={loading || project !== null} />
          <Autocomplete
            className="textField"
            options={projectsList}
            value={path}
            onChange={(_ev, newValue) => setPath(newValue)}
            renderInput={params => <TextField {...params} label="Path del projecte a descarregar:" />}
            disabled={loading || project !== null}
            filterOptions={filterOptions}
            disableOpenOnFocus
          />
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
      </main>
      <footer>
        <div className="credits">
          <strong>{name} v{version}</strong><br />
          © 2020-22 Departament d'Educació de la Generalitat de Catalunya<br />
          <a href="https://spdx.org/licenses/EUPL-1.2.html">Llicència Pública de la Unió Europea EUPL-1.2</a><br />
          <a href="https://github.com/projectestac/jclic-repo-utils">https://github.com/projectestac/jclic-repo-utils</a><br />
        </div>
      </footer>
    </Container>
  );
}

export default App;
