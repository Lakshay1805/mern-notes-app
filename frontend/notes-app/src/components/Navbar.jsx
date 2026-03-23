import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import ProfileInfo from './ProfileInfo'
import SearchBar from './SearchBar';
import { useState } from 'react';

const Navbar = ({userInfo , onSearchNote , handleClearSearch}) => {
  const [SearchQuery, setSearchQuery] = useState("")
    React.useEffect(() => {
    const handler = setTimeout(() => {
      if (SearchQuery.trim()) {
        onSearchNote(SearchQuery);
      } else {
        handleClearSearch();
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [SearchQuery])
  let handleSearch =()=>{
  }
  let onClearSearch =()=>{
    setSearchQuery("")
    handleClearSearch()
  }
  let navigate = useNavigate();
  const onLogout=()=>{
    localStorage.clear();
    navigate("/login");
  }
  return (
    <div className=' bg-white w-full py-2 px-6 flex items-center justify-between drop-shadow'>
      <Link to='/'><h2 className='text-xl font-medium text-black py-2'>My Notes</h2></Link>
        <SearchBar value={SearchQuery} onChange={(e)=>{
          setSearchQuery(e.target.value);
        }} onClearSearch={onClearSearch} handleSearch={handleSearch}/>
       {userInfo && <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>}
    </div>
  )
}

export default Navbar