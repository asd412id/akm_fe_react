import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import { RecoilRoot } from 'recoil';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <RecoilRoot>
    <App />
  </RecoilRoot>
  // </React.StrictMode>
);
