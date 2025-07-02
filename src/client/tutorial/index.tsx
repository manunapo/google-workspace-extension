import { createRoot } from 'react-dom/client';
import '../styles.css';
import Tutorial from './Tutorial';

const container = document.getElementById('index');
if (container) {
  const root = createRoot(container);
  root.render(<Tutorial />);
}
