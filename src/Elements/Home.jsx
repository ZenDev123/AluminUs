import React from 'react'
import Competitions from './Competitions'
import About from './About'
const Home = () => {
  return (
    <div>
      <div className="hero-section ">
        <div className='margin_top'>
          <h1 className="slide-up" style={{"fontSize": '52px'}}>Study Smarter, Not Harder...</h1>
          <p className="slide-up" style={{ animationDelay: '0.2s', marginTop: "20px" }}>
            A hub where students don’t just read — they <b>connect, share, and grow</b>.
          </p>
        </div>
      </div>
        <Competitions />
        <About />
    </div>
  )
}

export default Home
