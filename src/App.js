
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Error404 } from './pages/Errors';

import { TabPage } from './pages/tabs';
import { ClockPage } from './pages/clock';
import { UDiffPage } from './pages/udiff';

import './App.scss';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<TabPage />} />
            <Route path="/clock" element={<ClockPage />} />
            <Route path="/udiff" element={<UDiffPage />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
