import React from 'react'
import CreateGroup from './CreateGroup'

const Welcome = () => {
  return (
    <div className="flex items-center pt-8 py-6 flex-col ">
    <h1 className="text-[3em] text-center">
      Welcome to your group page!
    </h1>
    <div className="w-full flex justify-end pr-6 pt-4">
      <CreateGroup />
    </div>
  </div>
  )
}

export default Welcome