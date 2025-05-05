import ReactDOM from 'react-dom';
import AudioRecorder from './components/AudioRecorder';
import '../styles.css';

const App = () => {
  return (
    <>
      <AudioRecorder />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('index'));
