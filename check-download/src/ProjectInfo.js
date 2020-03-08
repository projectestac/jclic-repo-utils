import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import filesize from 'filesize';


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
}));


function ProjectInfo({ path, project }) {

  const classes = useStyles();

  const { title, author, date, activities, totalSize, files } = project;

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" component="h2">{title}</Typography>
      <table className={classes['dataCard']}>
        <tbody>
          <tr>
            <td>Autors:</td>
            <td>{author}</td>
          </tr>
          <tr>
            <td>Path:</td>
            <td>{path}</td>
          </tr>
          {date &&
            <tr>
              <td>Data:</td>
              <td>{date}</td>
            </tr>
          }
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
              <td>{new Intl.NumberFormat().format(files.length)}</td>
            </tr>
          }
        </tbody>
      </table>
    </Paper>
  );
}

export default ProjectInfo;