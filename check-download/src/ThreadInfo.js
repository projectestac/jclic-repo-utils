import React from 'react';
import { checkFetchResponse } from './utils';

class ThreadInfo extends React.Component {

  constructor(props) {
    super(props);
    const { base, path, filesAvailable, byteCount, setErr } = props;
    this.state = {
      file: null,
      timeWaiting: 0,
      base,
      path,
      filesAvailable,
      byteCount,
      setErr,
    };

    this.readFile = async function () {
      const startTime = Date.now();
      const { base, path, file, byteCount, setErr } = this.state;
      let result = false;
      try {
        const response = await fetch(`${base}/${path}/${file}`);
        checkFetchResponse(response);
        const blob = await (response.blob());
        const t = Date.now() - startTime;
        console.log(`File ${file} (${blob.type}) successfully loaded in ${t} ms`);
        byteCount.push(blob.size || 0);
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
        this.setState({ ...this.state, file: filesAvailable.shift(), timeWaiting: 0 });
        console.log(`Loading ${this.state.file}`)
        await this.readFile();
      }
      window.clearInterval(timeUpdater);
      this.setState({ ...this.state, file: '', timeWaiting: 0 });
    };
    
  }

  render() {
    const { file, timeWaiting } = this.state;
    return (
      <div>
        <div style={{ color: timeWaiting > 10000 ? 'red' : timeWaiting > 5000 ? 'orange' : 'green' }}>
          {file || '-'} {timeWaiting}
        </div>
      </div>
    );
  }
}

export default ThreadInfo;