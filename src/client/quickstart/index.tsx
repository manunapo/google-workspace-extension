import { createRoot } from 'react-dom/client';
import '../styles.css';
import Quickstart from './Quickstart';

const container = document.getElementById('index');
if (container) {
  const root = createRoot(container);
  root.render(<Quickstart />);
}
