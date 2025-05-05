import ReactDOM from 'react-dom';
import SpeechToText from './components/SpeechToText';
import '../styles.css';

const App = () => {
  return (
    <>
      <SpeechToText />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('index'));
