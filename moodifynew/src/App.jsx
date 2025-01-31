import React from "react";
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'

import SearchPage from './pages/SearchPage.jsx';
import LoginPage from './pages/LoginPage.jsx'

import './style.css';

function App()
{
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage/>}></Route>
          <Route path="/search" element={<SearchPage/>}></Route>
        </Routes>

      </div>
    </Router>
  )
}

export default App;