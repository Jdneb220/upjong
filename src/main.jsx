import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const data = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vT60SZT40kDkNNmm-epr5ZH03zHt-X0_Ovj9WdF5aMIR8uD5nHVoYKahtv5dEEGUO7TqRtffgXzQ9G2/pub?gid=0&single=true&output=csv')
  .then( res => res.text() )
  .then( csv => csv.split('\n').slice(1).map(row => row.split(',')) )
  .catch( err => {
    console.error('Error fetching or parsing data:', err);
    return []; // Return an empty array in case of error
  });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App data={data}/>
  </StrictMode>,
)
