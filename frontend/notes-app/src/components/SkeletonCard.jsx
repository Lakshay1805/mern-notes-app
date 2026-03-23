import React from 'react'

const SkeletonCard = () => {
  return (
    <div className='border border-gray-200 rounded m-4 p-4 bg-white animate-pulse'>
            <div className='flex items-center justify-between'>
                <div className='w-2/3'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                </div>
                <div className='w-6 h-6 bg-gray-200 rounded-full'></div>
            </div>
            <div className='h-3 bg-gray-200 rounded w-full mt-4'></div>
            <div className='h-3 bg-gray-200 rounded w-5/6 mt-2'></div>
            <div className='h-3 bg-gray-200 rounded w-4/6 mt-2'></div>
            <div className='flex items-center justify-between mt-4'>
                <div className='flex gap-2'>
                    <div className='h-4 bg-gray-200 rounded w-12'></div>
                    <div className='h-4 bg-gray-200 rounded w-12'></div>
                </div>
                <div className='flex gap-2'>
                    <div className='w-5 h-5 bg-gray-200 rounded'></div>
                    <div className='w-5 h-5 bg-gray-200 rounded'></div>
                </div>
            </div>
        </div>
  )
}

export default SkeletonCard