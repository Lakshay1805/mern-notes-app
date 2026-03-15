import React from 'react'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/SignUp/Register'
import {Route , Routes} from 'react-router-dom'
import Navbar from './components/Navbar'

const App = () => {
  return (<>
  <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/register' element={<Register/>}/>
  </Routes>
  </>)
}

export default App