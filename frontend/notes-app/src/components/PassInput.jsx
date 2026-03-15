import React from 'react'
import { useState } from 'react';
import {FaRegEye , FaRegEyeSlash} from 'react-icons/fa6'

const PassInput = ({value,placeholder,onChange}) => {
    const [ShowPassword, setShowPassword] = useState(false);
    const isShowPassword =()=>{
        setShowPassword(!ShowPassword);
    }
  return (
    <div className='flex items-center border-[1.5px] bg-transparent border-gray-200 px-5 rounded mb-3'>
        <input type={ShowPassword ? "text" :"password"} 
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Password"}
        className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'/>
        {ShowPassword ? (<FaRegEye
        size={22}
        onClick={isShowPassword}
        className= 'text-[#2B85FF] cursor-pointer'/>) :(
        <FaRegEyeSlash
        size={22}
        onClick={isShowPassword}
        className='text-slate-400 cursor-pointer'/>)}
    </div>
    
  )
}

export default PassInput