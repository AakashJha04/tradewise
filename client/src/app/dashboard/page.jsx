import React from 'react'
import Sidebar from '../_components/sidebar'

const Dashboard = () => {
  return (
    <div className='h-screen flex'>
        <div className='w-1/5'>
          <Sidebar/>
        </div>
        <div className='w-4/5'>
          <div className='h-1/2'>
            Portfolio
          </div>
          <div className='h-1/2'>
            Market Charts
          </div>
        </div>
      
    </div>
  )
}

export default Dashboard
