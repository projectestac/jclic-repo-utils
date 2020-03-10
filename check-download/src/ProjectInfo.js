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
import ThreadInfo from './ThreadInfo';

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
  threadInfo: {
    display: 'flex',
    alignItems: 'center',
    span: theme.spacing(1),
    border: '1px solid gray',
  }
}));

const numf = new Intl.NumberFormat().format;

function ProjectInfo({ base, path, project }) {

  const classes = useStyles();
  const { title, activities, totalSize, files } = project;
  const [status, setStatus] = useState('idle');
  const [numThreads, setNumThreads] = useState(3);
  const [threads, setThreads] = useState([]);
  let filesAvailable = [...files];
  let byteCount = [];
  let startTime = 0;
  let updateInfo = null;
  const [err, setErr] = useState(null);

  const [totalTime, setTotalTime] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [filesPending, setFilesPending] = useState(files.length);

  async function startDownloading() {
    startTime = Date.now();
    setErr(null);
    setStatus('downloading');
    updateInfo = window.setInterval(() => {
      setTotalTime(Date.now() - startTime);
      setTotalBytes(byteCount.reduce((total, value) => total + value, 0));
      setFilesPending(filesAvailable.length);
      if (filesPending < 1) {
        window.clearInterval(updateInfo);
        updateInfo = null;
        setStatus('finished');
      }
    }, 1000);
    const th = [];
    const thRefs = [];
    for (let n = 0; n < numThreads; n++) {
      const ref = React.createRef();
      const ti = <ThreadInfo ref={ref} {...{ base, path, filesAvailable, byteCount, setErr }} />;
      thRefs.push(ref);
      th.push(ti);
    }
    setThreads(th);

    // Start threads
    window.setTimeout(
      () => thRefs.forEach(ref => ref.current.startThread())
      , 1000);
  };

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
          <Select value={numThreads} onChange={ev => setNumThreads(ev.target.value)} labelWidth={120} title="Nombre màxim de connexions simulànies">
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
              <td>{numf(filesPending)} / {numf(files.length)}</td>
            </tr>
            <tr>
              <td>Total descarregat:</td>
              <td>{filesize(totalBytes)}</td>
            </tr>
            <tr>
              <td>Temps total:</td>
              <td>{numf(totalTime)} ms</td>
            </tr>
            {status === 'downloading' &&
              threads.map((thread, n) => (
                <tr key={n}>
                  <td>Fil {n}:</td>
                  <td>{thread}</td>
                </tr>
              ))
            }
            {/*
            <tr>
              <td>Fitxers pendents:</td>
              <td>
                <ul className={classes.fileList}>
                  {fPending.map((f, n) => <li key={n}>{f}</li>)}
                </ul>
              </td>
            </tr>
            */}
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