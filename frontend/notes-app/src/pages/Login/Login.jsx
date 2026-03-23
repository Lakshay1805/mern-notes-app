import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PassInput from '../../components/PassInput'
import { useState } from 'react'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'

const Login = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Error, setError] = useState(null);

  const navigate = useNavigate();
  const handleLogin=async(e)=>{
    e.preventDefault();
    if(!validateEmail(Email)){
      setError("Please enter a valid email address.");
      return;
    }
    if(!Password){
      setError("Please enter a password.");
      return;
    }
    setError("");
    try{
      const response = await axiosInstance.post("/login" , {
        email:Email,
        password:Password
      })
      if(response.data && response.data.accessToken){
        localStorage.setItem("token" , response.data.accessToken);
        navigate("/")
      }
    }catch(error){
      if(error.response && error.response.data && error.response.data.message){
        setError(error.response.data.message);
        return;
      }
    }
  }

  return (<><div className='flex items-center justify-center mt-28'>
    <div className='w-96 border border-gray-200 rounded px-7 py-10 bg-white'>
      <form onSubmit={handleLogin}>
        <h4 className='text-2xl font-medium mb-5'>Login</h4>
        <input type="email" placeholder='Email' className='input-box' value={Email} onChange={(e)=>setEmail(e.target.value)}/>

        <PassInput value={Password} onChange={(e)=>(setPassword(e.target.value))}/>

          {Error && <p className='text-red-500 text-xs pb-1'>{Error}</p>}
        <button className='bg-primary btn-primary active:scale-95'>Login</button>
        <p className='text-center text-sm mt-4'>Not registered yet ? <Link to='/register' className='underline text-blue-600 font-medium'>Create an account</Link></p>
      </form>
    </div>
  </div>
  </>)
}

export default Login