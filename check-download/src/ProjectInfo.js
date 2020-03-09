import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import filesize from 'filesize';
import { checkFetchResponse } from './utils';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    '& > *': {
      margin: theme.spacing(2),
    },
  },
  dataCard: {
    borderCollapse: 'collapse',
    minWidth: '80%',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    "& td": {
      border: 'none',
      borderBottom: '1px solid lightgray',
      borderTop: '1px solid lightgray',
      paddingLeft: 0,
    },
    "& td:first-child": {
      width: '12rem',
      fontWeight: 'bold',
      paddingRight: '4pt',
      verticalAlign: 'top',
    },
  },
  controlPanel: {
  },
  error: {
    color: theme.palette.error.main,
    fontWeight: 'bold',
  },
  fileList: {
    fontFamily: 'mono',
    fontSize: '0.75rem',
    padding: 0,
    listStyleType: 'none',
  },
  startPanel: {
    display: 'flex',
    alignItems: 'center',
    "& > *": {
      margin: theme.spacing(1),
      minWidth: '120px',
    },
  },
}));

const numf = new Intl.NumberFormat().format;

function ProjectInfo({ base, path, project }) {

  const classes = useStyles();
  const { title, activities, totalSize, files } = project;
  const [status, setStatus] = useState('idle');
  const [threads, setThreads] = useState(3);
  const [fPending, setFPending] = useState(files);
  let filesPending = files;
  let filesAvailable = [...files];
  const [fLoaded, setFLoaded] = useState(0);
  let filesLoaded = 0;
  const [tSize, setTSize] = useState(0);
  let totalFileSize = 0;
  const [totalTime, setTotalTime] = useState(0);
  const [err, setErr] = useState(null);
  let totalTimeCounter = null;

  async function startDownloading() {
    const start = Date.now();
    setErr(null);
    setTotalTime(0);
    setTSize(0);
    setFLoaded(0);
    setFPending(files);
    setStatus('downloading');
    totalTimeCounter = window.setInterval(() => setTotalTime(Date.now() - start), 1000);

    for (let n = 0; n < threads; n++)
      downloadThread();

  };

  async function downloadThread() {
    while (filesAvailable.length > 0)
      await readFile(filesAvailable.shift());
  }

  async function readFile(file) {
    const start = Date.now();
    filesAvailable = filesAvailable.filter(f => f !== file);
    try {
      const response = await fetch(`${base}/${path}/${file}`);
      checkFetchResponse(response);
      const blob = await (response.blob());
      const t = Date.now() - start;
      console.log(`File ${file} (${blob.type}) successfully loaded in ${t} ms`);
      filesPending = filesPending.filter(f => f !== file);
      filesLoaded = filesLoaded + 1;
      if (filesLoaded >= files.length) {
        console.log('All files loaded!')
        setStatus('finished');
        if (totalTimeCounter) {
          window.clearTimeout(totalTimeCounter);
          totalTimeCounter = null;
        }
        setTotalTime(t);
      }
      totalFileSize = totalFileSize + blob.size;
      console.log(filesLoaded, totalFileSize);
      setFLoaded(filesLoaded);
      setTSize(totalFileSize);
      setFPending(filesPending);
      return true;
    } catch (err) {
      const msg = `Error loading "${file}": ${err.toString()}`;
      console.err(msg);
      setErr(msg);
      return false;
    }
  }

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" component="h2">Activitat "{title}"</Typography>
      <table className={classes['dataCard']}>
        <tbody>
          <tr>
            <td>Path:</td>
            <td>{path}</td>
          </tr>
          {activities &&
            <tr>
              <td>Activitats:</td>
              <td>{activities}</td>
            </tr>
          }
          {totalSize &&
            <tr>
              <td>Mida total:</td>
              <td>{filesize(totalSize)}</td>
            </tr>
          }
          {files &&
            <tr>
              <td>Fitxers:</td>
              <td>{numf(files.length)}</td>
            </tr>
          }
        </tbody>
      </table>
      <div className={classes.startPanel}>
        <FormControl variant="outlined">
          <InputLabel>Connexions</InputLabel>
          <Select value={threads} onChange={ev => setThreads(ev.target.value)} labelWidth={120} title="Nombre màxim de connexions simulànies">
            {[1, 2, 3, 4, 5, 6].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={startDownloading} disabled={status !== 'idle'}>
          Inicia la descàrrega
      </Button>
      </div>
      <div className={classes.controlPanel}>
        <table className={classes['dataCard']}>
          <tbody>
            <tr>
              <td>Estat:</td>
              <td>{status}</td>
            </tr>
            <tr>
              <td>Fitxers descarregats:</td>
              <td>{numf(fLoaded)} / {numf(files.length)}</td>
            </tr>
            <tr>
              <td>Total descarregat:</td>
              <td>{filesize(tSize)}</td>
            </tr>
            <tr>
              <td>Temps total:</td>
              <td>{numf(totalTime)} ms</td>
            </tr>
            <tr>
              <td>Fitxers pendents:</td>
              <td>
                <ul className={classes.fileList}>
                  {fPending.map((f, n) => <li key={n}>{f}</li>)}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        {err &&
          <p className={classes.error}>{err}</p>
        }
      </div>
    </Paper>
  );
}

export default ProjectInfo;