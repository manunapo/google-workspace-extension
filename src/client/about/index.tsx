import { createRoot } from 'react-dom/client';
import '../styles.css';
import About from './About';

const container = document.getElementById('index');
if (container) {
  const root = createRoot(container);
  root.render(<About />);
}
