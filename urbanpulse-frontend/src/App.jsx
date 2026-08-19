import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import FloatingChatbot from './components/FloatingChatbot.jsx'

import background from './assets/urbanpulse-background.png'

export default function App() {
  const path = window.location.pathname

  // Login page
  if (path === '/login') {
    return <Login />
  }

  // Sign up page
  if (path === '/signup') {
    return <SignUp />
  }

  // Home page
  return (
    <div className="min-h-screen">

      <Navbar />

      <main
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        <Hero />
      </main>

      <FloatingChatbot />

    </div>
  )
}