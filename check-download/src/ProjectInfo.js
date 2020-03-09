import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
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
      minWidth: '8rem',
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
  }
}));

const numf = new Intl.NumberFormat().format;

function ProjectInfo({ base, path, project }) {

  const classes = useStyles();
  const { title, activities, totalSize, files } = project;
  const [status, setStatus] = useState('idle');
  const [fPending, setFPending] = useState(files);
  let filesPending = files;
  const [fLoaded, setFLoaded] = useState(0);
  let filesLoaded = 0;
  const [tSize, setTSize] = useState(0);
  let totalFileSize = 0;
  const [totalTime, setTotalTime] = useState(0);
  const [err, setErr] = useState(null);
  let totalTimeCounter = null;

  const startDownloading = () => {
    const start = Date.now();
    setErr(null);
    setTotalTime(0);
    setTSize(0);
    setFLoaded(0);
    setFPending(files);
    setStatus('downloading');
    totalTimeCounter = window.setInterval(() => setTotalTime(Date.now() - start), 1000);

    files.forEach(file => {
      fetch(`${base}/${path}/${file}`)
        .then(checkFetchResponse)
        .then(res => res.blob())
        .then(blob => {
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
        })
        .catch(err => setErr(err.toString()));
    });
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
      <Button variant="contained" color="primary" onClick={startDownloading} disabled={status !== 'idle'}>
        Inicia la descàrrega
      </Button>
      <div className={classes.controlPanel}>
        <table className={classes['dataCard']}>
          <tbody>
            <tr>
              <td>Estat:</td>
              <td>{status}</td>
            </tr>
            <tr>
              <td>Fitxers descarregats:</td>
              <td>{numf(fLoaded)} / {files.length}</td>
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