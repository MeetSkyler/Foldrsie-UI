'use client'
import Navbar from "./navbar"
import SideDrawer from "./sideDrawer"
import Sidebar from "./sidebar"

export default function Appshell({children}: {children: React.ReactNode}) {
  return(
   <>
   <div className="w-full h-screen flex overflow-hidden flex-row ">
      {/* ....LeftBar//Sidebar.... */}
     <Sidebar/>
    
  <div className="flex-1 flex flex-col min-h-0">

     {/* ....Navbar.... */}
      <Navbar/>

      <div className="flex-1 flex flex-row bg-amber-300 min-h-0">
   
      {/* ....Main Center Screen Pages.... */}
       <main className="flex-1 overflow-y-auto">{children}</main>

       {/* ....Rightbar//Side Drawer.... */}
       <SideDrawer/>
     
      </div>
  

  </div>
   
   </div>
   </>
  )
}