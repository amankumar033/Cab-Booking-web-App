import React, { useContext } from 'react'
import {Routes,Route} from 'react-router-dom'
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import CaptainLogin from './pages/captainLogin'
import CaptainSignup from './pages/captainSignup'
import UserProtectWrapper from './pages/UserProtectWrapper'
import UserLogout from './pages/UserLogout'
import UserHome from './pages/UserHome'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectWrapper from './pages/CaptainProtectorWrapper'
import CaptainLogout from './pages/CaptainLogout'



const App = () => {
  
  return (
    <Routes>
      <Route path="/" element={<Start/>} />
      <Route path="/userLogin" element={<UserLogin/>} />
      <Route path="/userSignup" element={<UserSignup/>} />
      <Route path="/captainSignup" element={<CaptainSignup/>} />
      <Route path="/captainLogin" element={<CaptainLogin/>} />
      <Route path="/UserHome" element={
        <UserProtectWrapper>
        <UserHome/>
        </UserProtectWrapper> 
        } />
      <Route path="/CaptainHome" element={
        <CaptainProtectWrapper>
          <CaptainHome/>
        </CaptainProtectWrapper>
        } />

      <Route path="/userLogout" element={<UserLogout/>} />
      <Route path="/captainLogout" element={<CaptainLogout/>} />
    </Routes>
  )
}

export default App