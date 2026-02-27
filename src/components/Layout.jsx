import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'
import SecurityBadgeSection from './SecurityBadgeSection'

function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-[1580px] px-5 pb-10 pt-6 sm:px-7 lg:px-10">
          <Outlet />
        </div>
      </main>
      <SecurityBadgeSection />
      <Footer />
    </div>
  )
}

export default Layout
