import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import filesize from 'filesize';
import ThreadInfo from './ThreadInfo';

const numf = new Intl.NumberFormat().format;

const STATUS = {
  idle: 'en espera',
  downloading: 'descarregant',
  success: 'finalitzat',
  error: 'error',
};

function ProjectInfo({ base, path, project }) {

  const { title, activities, totalSize, files } = project;
  let filesAvailable = [...files];
  let totalDownloaded = 0;
  let filesDone = 0;
  let status = STATUS.idle;
  const [statusText, setStatusText] = useState(status);
  const [threadRefs, setThreadRefs] = useState([]);
  const [threadObjs, setThreadObjs] = useState([]);
  const [err, setErr] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [totalBytes, setTotalBytes] = useState(totalDownloaded);
  const [filesDownloaded, setFilesDownloaded] = useState(0);

  const setStatus = (text) => {
    status = text;
    setStatusText(status);
  }

  const setFilesDone = (num) => {
    filesDone = num;
    setFilesDownloaded(num);
  }

  async function startDownloading() {
    const startTime = Date.now();
    setErr(null);
    setStatus(STATUS.downloading);
    setFilesDone(0);
    let timeUpdater = window.setInterval(() => {
      console.log(status)
      if (status !== STATUS.downloading) {
        window.clearInterval(timeUpdater);
        timeUpdater = 0;
      } else
        setTotalTime(Date.now() - startTime);
    }, 1000);

    threadRefs.forEach(ref => {
      if (ref.current)
        ref.current.startThread();
    });
  };

  const fileDownloaded = (bytesDownloaded) => {
    totalDownloaded += bytesDownloaded;
    setTotalBytes(totalDownloaded);
    setFilesDone(++filesDone);
    if (filesDone >= files.length)
      setStatus(STATUS.success);
  }

  const setNumThreads = (n) => {
    const tr = Array(n).fill().map((_, k) => threadRefs[k] || React.createRef());
    setThreadRefs(tr);
    setThreadObjs(Array(n).fill().map((_, k) => <ThreadInfo key={k} num={k} ref={tr[k]} {...{ base, path, filesAvailable, fileDownloaded, setErr }} />))
  }

  useEffect(() => {
    if (threadRefs.length < 1)
      setNumThreads(3);
  });

  return (
    <Paper className="projectInfo">
      <Typography variant="h5" component="h2">Activitat "{title}"</Typography>
      <table className="dataCard">
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
      <div className="startPanel">
        <FormControl margin="dense" variant="outlined">
          <InputLabel>Connexions:</InputLabel>
          <Select
            value={threadRefs.length}
            onChange={ev => setNumThreads(ev.target.value)}
            labelWidth={120}
            title="Nombre màxim de connexions simulànies"
            disabled={statusText !== STATUS.idle}
          >
            {[1, 2, 3, 4, 5, 6].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={startDownloading}
          disabled={statusText !== STATUS.idle}
        >
          Inicia la descàrrega
      </Button>
      </div>
      <div className="controlPanel">
        <table className="dataCard">
          <tbody>
            <tr>
              <td>Estat:</td>
              <td>{statusText}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Fitxers descarregats:</td>
              <td>{numf(filesDownloaded)} / {numf(files.length)}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Total descarregat:</td>
              <td>{filesize(totalBytes)}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Temps total:</td>
              <td>{numf(totalTime)} ms</td>
              <td></td>
              <td></td>
            </tr>
            {threadObjs}
          </tbody>
        </table>
        {err &&
          <p className="error">{err}</p>
        }
      </div>
    </Paper>
  );
}

export default ProjectInfo;