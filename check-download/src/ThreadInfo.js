import React from 'react';
import { checkFetchResponse } from './utils';
import filesize from 'filesize';

const numf = new Intl.NumberFormat().format;

const WARN_DELAY = 3000;
const ERR_DELAY = 6000;

class ThreadInfo extends React.Component {

  constructor(props) {
    super(props);
    const { num, base, path, fileList, fileDownloaded, setError } = props;
    this.state = {
      file: null,
      timeWaiting: 0,
      localByteCount: 0,
      localFileCount: 0,
    };

    this.fileList = fileList;
    this.fileDownloaded = fileDownloaded;
    this.setError = setError;
    this.num = num;
    this.base = base;
    this.path = path;

    this.readFile = async function (file) {
      const startTime = Date.now();
      const { localByteCount, localFileCount } = this.state;
      let result = false;
      try {
        const response = await fetch(`${this.base}/${this.path}/${file}`);
        checkFetchResponse(response);
        const blob = await (response.blob());
        const time = Date.now() - startTime;
        console.log(`File ${file} (${blob.type}) successfully loaded in ${time} ms`);
        this.fileDownloaded(file, blob.size || 0, time);
        this.setState({ ...this.state, localFileCount: localFileCount + 1, localByteCount: localByteCount + blob.size });
        result = true;
      } catch (err) {
        const msg = `Error loading "${file}": ${err.toString()}`;
        console.log(msg);
        this.setError(msg);
      }
      return result;
    };

    this.startThread = async function () {
      let start = Date.now();

      const timeUpdater = window.setInterval(() => {
        this.setState({ ...this.state, timeWaiting: Date.now() - start });
      }, 500);

      while (this.fileList.length > 0) {
        start = Date.now();
        const file = this.fileList.shift();
        this.setState({ ...this.state, file, timeWaiting: 0 });
        console.log(`Loading ${file} - ${this.fileList.length} files are still available`)
        await this.readFile(file);
      }

      window.clearInterval(timeUpdater);
      this.setState({ ...this.state, file: '', timeWaiting: 0 });
    };

  }

  render() {
    const { file, timeWaiting, localByteCount, localFileCount } = this.state;
    return (
      <tr key={this.num}>
        <td>{`Connexió #${this.num + 1}:`}</td>
        <td style={{ color: timeWaiting > ERR_DELAY ? 'red' : timeWaiting > WARN_DELAY ? 'orange' : 'green' }}>{file}</td>
        <td>{(file && `${numf(timeWaiting)} ms`) || (localFileCount && `${numf(localFileCount)} fitxers`) || ''}</td>
        <td>{(localByteCount && filesize(localByteCount)) || ''}</td>
      </tr>
    );
  }
}

export default ThreadInfo;