'use client'
import { usePathname } from "next/navigation"
import Navbar from "./navbar"
import SideDrawer from "./sideDrawer"
import Sidebar from "./sidebar"
import MobileAppshell from "./mobile/MobileAppshell"

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
   {/* ..........DesktopShell.......... (md and up) */}
   <div className="hidden md:flex w-full h-screen overflow-hidden flex-row ">
      {/* ....LeftBar//Sidebar.... */}
     <Sidebar initialCollapsed={initialSidebarCollapsed}/>

  <div className="flex-1 min-w-0 flex flex-col min-h-0">

     {/* ....Navbar.... */}
      <Navbar/>

      <div className="flex-1 min-w-0 flex flex-row bg-neutral-900 min-h-0">

      {/* ....Main Center Screen Pages.... */}
       <main className="flex-1 min-w-0 overflow-hidden">{children}</main>

       {/* ....Rightbar//Side Drawer.... */}
       {!hideSideDrawer && <SideDrawer/>}

      </div>


  </div>

   </div>

   {/* ..........MobileShell.......... (below md) */}
   <div className="flex md:hidden w-full h-screen overflow-hidden">
     <MobileAppshell>{children}</MobileAppshell>
   </div>
   </>
  )
}