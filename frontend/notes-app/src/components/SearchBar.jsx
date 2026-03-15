import React from 'react'
import { FaMagnifyingGlass } from "react-icons/fa6";
import {IoMdClose} from 'react-icons/io'

const SearchBar = ({value , onClearSearch , onChange , handleSearch}) => {
  return (
    <div className='w-80 flex items-center bg-slate-100 px-4 rounded-md'>
        <input type="text" placeholder='Search Notes' className='w-full text-xs bg-transparent py-[11px] outline-none' value={value} onChange={onChange}/>
        {value && <IoMdClose className='mr-4 text-xl text-slate-500 hover:text-black cursor-pointer' onClick={onClearSearch}/>}
        <FaMagnifyingGlass className='text-slate-400 cursor-pointer hover:text-black' onClick={handleSearch}/>
    </div>
  )
}

export default SearchBar