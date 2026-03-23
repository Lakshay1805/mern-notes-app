import React from 'react'
import { getInitials } from '../utils/helper'
import {FiLogOut} from 'react-icons/fi'

const ProfileInfo = ({userInfo , onLogout}) => {
  return (
    <div className='flex items-center gap-3'>
        <div className='w-12 h-12 flex items-center rounded-full text-slate-900 justify-center font-medium bg-slate-100'>
            {getInitials(userInfo.fullName)}
        </div>

        <div>
            <p className='text-sm font-medium'>{userInfo.fullName}</p>
            <button
              className='mt-1 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-all duration-200 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-300'
              onClick={onLogout}
            >
              <FiLogOut className='text-sm' />
              Logout
            </button>
        </div>
    </div>
  )
}

export default ProfileInfo