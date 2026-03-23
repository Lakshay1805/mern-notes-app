import React from 'react'
import PassInput from '../../components/PassInput'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { useState } from 'react'

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate();

  const handleSignup = async(e)=>{
    e.preventDefault();
    if(!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }
    if(!password){
      setError("Please enter a password.");
      return;
    }
    if(!name){
      setError("Please enter a password.");
      return;
    }
    setError("");
    try{
      const response =await axiosInstance.post("/register" ,{
        fullName:name,
        email:email,
        password:password
      })
      if(response.data && response.data.error){
        setError(response.data.error);
        return;
      }
      if(response.data && response.data.accessToken){
        localStorage.setItem("token" , response.data.accessToken)
        navigate("/")
      }
    }catch(error){
      if(error.response &&error.response.data && error.response.data.message){
        setError(error.response.data.message);
        return;
      }
    }
  }
  return (<><div className='flex items-center justify-center mt-28'>
    <div className='w-96 border border-gray-200 rounded px-7 py-10 bg-white'>
      <form onSubmit={handleSignup}>
        <h4 className='text-2xl font-medium mb-5'>Register</h4>
        <input type="text" placeholder='Name' className='input-box' value={name} onChange={(e)=>setName(e.target.value)}/>
        <input type="email" placeholder='Email' className='input-box' value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <PassInput value={password} onChange={(e)=>setPassword(e.target.value)}/>
          {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}
        <button className='bg-primary btn-primary active:scale-95'>Register</button>
        <p className='text-center text-sm mt-4'>Aready have an account ? <Link to='/login' className='underline text-blue-600 font-medium'>Login</Link></p>

      </form>
      </div>
      </div>
      </>)
}

export default Register