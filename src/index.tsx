import './index.scss';

import { createRoot } from 'react-dom/client';

import { AppRouter } from './App';

const root = document.getElementById("root") as HTMLElement;
const reactRoot = createRoot(root);
reactRoot.render(<AppRouter />);