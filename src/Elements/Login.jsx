import React from 'react'
import GoogleIcon from '@mui/icons-material/Google';

const Login = ({handleSignIn}) => {
  return (
    <div className="login-page">
        <h2 className='slide-up'>Welcome to AluminUS</h2>
        <button className='login_btn' onClick={handleSignIn}><GoogleIcon />&nbsp;&nbsp;&nbsp;Sign In with Google</button>
    </div>
  )
}

export default Login
