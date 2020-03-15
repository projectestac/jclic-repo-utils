import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import filesize from 'filesize';
import ThreadInfo from './ThreadInfo';
import { DEFAULT_BASE } from './App';

const MAX_THREADS = 6;
const DEFAULT_THREADS = 6;
const STALLED_TIME = 20000;

const STATUS = {
  idle: 'EN ESPERA',
  downloading: 'DESCARREGANT',
  success: 'FINALITZAT',
  error: 'ERROR',
};

const numf = new Intl.NumberFormat().format;

let status = STATUS.idle;
let fileList = [];
let totalDownloaded = 0;
let fileCount = 0;
let stalledFiles = 0;
let startTime = Date.now();
let data = [{ time: 0, files: 0, bytes: 0 }];

function ProjectInfo({ base, path, project, initialTime }) {

  const { title, activities, totalSize, files } = project;

  const [statusText, setStatusText] = useState(status);
  const [threadRefs, setThreadRefs] = useState([]);
  const [threadObjs, setThreadObjs] = useState([]);
  const [err, setErr] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [totalBytes, setTotalBytes] = useState(totalDownloaded);
  const [filesDone, setFilesDone] = useState(0);
  const [filesStalled, setFilesStalled] = useState(0);
  const [chartData, setChartData] = useState(data);

  if (!fileList || !fileList.length)
    fileList = [...files];

  const setStatus = (text) => {
    status = text;
    setStatusText(status);
  }

  const setError = err => {
    if (err)
      setStatus(STATUS.error);
    setErr(err);
  }

  const updateFileCount = (num) => {
    fileCount = num;
    setFilesDone(num);
  }

  async function startDownloading() {
    startTime = Date.now();
    setError(null);
    setStatus(STATUS.downloading);
    updateFileCount(0);
    let timeUpdater = window.setInterval(() => {
      if (status !== STATUS.downloading) {
        window.clearInterval(timeUpdater);
        timeUpdater = 0;
      } else
        setTotalTime(Date.now() - startTime);
    }, 500);

    threadRefs.forEach(ref => {
      if (ref.current)
        ref.current.startThread();
    });
  };

  const fileDownloaded = (file, bytesDownloaded, timeSpend) => {
    totalDownloaded += bytesDownloaded;
    setTotalBytes(totalDownloaded);
    updateFileCount(++fileCount);
    const time = Math.round((Date.now() - startTime) / 100) / 10;
    const kBytes = Math.round(totalDownloaded / 1024);
    if (timeSpend >= STALLED_TIME) {
      console.log(`Stalled file: ${file} (${timeSpend}")`);
      stalledFiles++;
      setFilesStalled(stalledFiles);
    }
    data = [...data, { time, kBytes, files: fileCount }]
    setChartData(data);
    if (fileCount >= files.length)
      setStatus(STATUS.success);
  }

  const setNumThreads = (n) => {
    const tr = Array(n).fill().map((_, k) => threadRefs[k] || React.createRef());
    setThreadRefs(tr);
    setThreadObjs(Array(n).fill().map((_, k) => <ThreadInfo key={k} num={k} ref={tr[k]} {...{ base, path, fileList, fileDownloaded, setError }} />))
  }

  useEffect(() => {
    if (threadRefs.length < 1)
      setNumThreads(DEFAULT_THREADS);
  });

  return (
    <Paper className="projectInfo">
      <Typography variant="h5" component="h2">Activitat "{title}"</Typography>
      <table className="dataCard">
        <tbody>
          <tr>
            <td>Path:</td>
            <td>
              {
                base === DEFAULT_BASE
                  ? <a href={`https://clic.xtec.cat/repo/?prj=${path}`} target="_blank" rel="noopener noreferrer">{path}</a>
                  : `${base}/${path}`
              }
            </td>
          </tr>
          <tr className={initialTime >= STALLED_TIME ? 'red' : ''}>
            <td>Càrrega inicial:</td>
            <td>{`${numf(initialTime)} ms`}</td>
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
            value={threadRefs.length || DEFAULT_THREADS}
            onChange={ev => setNumThreads(ev.target.value)}
            labelWidth={120}
            title="Nombre màxim de connexions simulànies"
            disabled={statusText !== STATUS.idle}
          >
            {Array(MAX_THREADS).fill().map((_v, n) => <MenuItem key={n} value={n + 1}>{n + 1}</MenuItem>)}
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
              <td style={{ color: statusText === STATUS.error ? 'red' : statusText === STATUS.success ? 'green' : 'inherit' }}>{statusText}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Fitxers descarregats:</td>
              <td>{numf(filesDone)} / {numf(files.length)}</td>
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
            <tr>
              <td>Taxa de transferència:</td>
              <td><strong>{totalTime > 0 ? `${filesize(totalBytes / (totalTime / 1000))}/s` : ''}</strong></td>
              <td></td>
              <td></td>
            </tr>
            <tr className={filesStalled > 0 ? 'red' : ''}>
              <td>{`Aturades > ${STALLED_TIME / 1000}":`}</td>
              <td>{filesStalled}</td>
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
      <LineChart className="chart" width={500} height={200} data={chartData} >
        <Legend verticalAlign="top" margin={{ bottom: 30 }} />
        <Line name="KBytes" type="monotone" dataKey="kBytes" stroke="#8884d8" strokeWidth={2} dot={false} isAnimationActive={false} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" type="number" unit="s" />
        <YAxis />
      </LineChart>
      <LineChart className="chart" width={500} height={200} data={chartData} >
        <Legend verticalAlign="top" margin={{ bottom: 30 }} />
        <Line name="Fitxers" type="monotone" dataKey="files" stroke="#82ca9d" strokeWidth={2} dot={false} isAnimationActive={false} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" type="number" unit="s" />
        <YAxis />
      </LineChart>

    </Paper>
  );
}

export default ProjectInfo;