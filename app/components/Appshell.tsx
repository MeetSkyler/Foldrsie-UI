'use client'
import { usePathname } from "next/navigation"
import Navbar from "./navbar"
import SideDrawer from "./sideDrawer"
import Sidebar from "./sidebar"

export default function Appshell({
  children,
  initialSidebarCollapsed,
}: {
  children: React.ReactNode;
  initialSidebarCollapsed: boolean;
}) {
  const pathname = usePathname();
  const hideSideDrawer = pathname === "/gallery";

  return(
   <>
   <div className="w-full h-screen flex overflow-hidden flex-row ">
      {/* ....LeftBar//Sidebar.... */}
     <Sidebar initialCollapsed={initialSidebarCollapsed}/>
    
  <div className="flex-1 flex flex-col min-h-0">

     {/* ....Navbar.... */}
      <Navbar/>

      <div className="flex-1 flex flex-row bg-neutral-900 min-h-0">
   
      {/* ....Main Center Screen Pages.... */}
       <main className="flex-1 overflow-hidden">{children}</main>

       {/* ....Rightbar//Side Drawer.... */}
       {!hideSideDrawer && <SideDrawer/>}
     
      </div>
  

  </div>
   
   </div>
   </>
  )
}