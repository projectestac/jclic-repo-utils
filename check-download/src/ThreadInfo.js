import React from 'react';
import { checkFetchResponse } from './utils';
import filesize from 'filesize';

const numf = new Intl.NumberFormat().format;

const WARN_DELAY = 3000;
const ERR_DELAY = 6000;

class ThreadInfo extends React.Component {

  constructor(props) {
    super(props);
    const { num, base, path, filesAvailable, fileDownloaded, setErr } = props;
    this.state = {
      name: `Procés #${num + 1}`,
      num,
      file: null,
      timeWaiting: 0,
      base,
      path,
      filesAvailable,
      fileDownloaded,
      localByteCount: 0,
      setErr,
    };

    this.readFile = async function (file) {
      const startTime = Date.now();
      const { base, path, fileDownloaded, localByteCount, setErr } = this.state;
      let result = false;
      try {
        const response = await fetch(`${base}/${path}/${file}`);
        checkFetchResponse(response);
        const blob = await (response.blob());
        const t = Date.now() - startTime;
        console.log(`File ${file} (${blob.type}) successfully loaded in ${t} ms`);
        fileDownloaded(blob.size || 0);
        this.setState({ ...this.state, localByteCount: localByteCount + blob.size });
        result = true;
      } catch (err) {
        const msg = `Error loading "${file}": ${err.toString()}`;
        console.log(msg);
        setErr(msg);
      }
      return result;
    };

    this.startThread = async function () {
      let start = Date.now();
      const { filesAvailable } = this.state;

      const timeUpdater = window.setInterval(() => {
        this.setState({ ...this.state, timeWaiting: Date.now() - start });
      }, 1000);

      while (filesAvailable.length > 0) {
        start = Date.now();
        const file = filesAvailable.shift();
        this.setState({ ...this.state, file, timeWaiting: 0 });
        console.log(`Loading ${file}`)
        await this.readFile(file);
      }

      window.clearInterval(timeUpdater);
      this.setState({ ...this.state, file: '', timeWaiting: 0 });
    };

  }

  render() {
    const { name, num, file, timeWaiting, localByteCount } = this.state;
    return (
      <tr key={num}>
        <td>{name}</td>
        <td style={{ color: timeWaiting > ERR_DELAY ? 'red' : timeWaiting > WARN_DELAY ? 'orange' : 'green' }}>{file}</td>
        <td>{`${numf(timeWaiting)} ms`}</td>
        <td>{filesize(localByteCount)}</td>
      </tr>
    );
  }
}

export default ThreadInfo;