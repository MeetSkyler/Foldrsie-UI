// ......Sidebar........//
'use client'
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react"
  import Link from 'next/link';



const Sidebar = () => {
  const pathname=usePathname();

  const [iscollapsed, setiscollapsed] = useState(false);
  useEffect(()=>{
    const savedCollapsed=localStorage.getItem("sidebar-Collapsed");
  setiscollapsed(savedCollapsed==="true");
  },[]);
  function toggleCollapsed() {
    const toggle=!iscollapsed;
    setiscollapsed(toggle);
    localStorage.setItem("sidebar-Collapsed",String(toggle));
  }
  const TopNavLinks=[
    {icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <g clipPath="url(#clip0_2002_16937)">
    <path d="M2.5 8.75V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5H8.75" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path opacity="0.9" d="M2.80371 13.333L5.66152 10.2042C6.23395 9.57744 7.18593 9.48104 7.87239 9.98026L12.0442 13.0142C12.329 13.2214 12.6722 13.333 13.0244 13.333L16.8728 13.333" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <line opacity="0.9" x1="12.683" y1="7.91953" x2="13.5663" y2="7.91953" stroke="currentColor" strokeOpacity="0.97" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M4.37222 2.0017C4.42907 1.83109 4.7376 1.83109 4.79444 2.0017C4.96505 2.51377 5.23966 3.16548 5.62042 3.54624C6.00118 3.927 6.6529 4.20161 7.16497 4.37222C7.33557 4.42907 7.33557 4.7376 7.16497 4.79444C6.6529 4.96505 6.00118 5.23966 5.62042 5.62042C5.23966 6.00118 4.96505 6.6529 4.79444 7.16497C4.7376 7.33557 4.42907 7.33557 4.37222 7.16497C4.20161 6.6529 3.927 6.00118 3.54624 5.62042C3.16548 5.23966 2.51377 4.96505 2.0017 4.79444C1.83109 4.7376 1.83109 4.42907 2.0017 4.37222C2.51377 4.20161 3.16548 3.927 3.54624 3.54624C3.927 3.16548 4.20161 2.51377 4.37222 2.0017Z" fill="currentColor" fillOpacity="0.97"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_16937">
      <rect width="20" height="20" fill="white"/>
    </clipPath>
  </defs>
</svg>,
  label:"Generate",href:"/"},
    {
      icon:<svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
  <g clipPath="url(#clip0_2002_16952)">
    <rect x="2.13477" y="4.58301" width="13.3333" height="13.3333" rx="1.66667" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M2.13672 12.9167L4.93551 10.051C5.61861 9.35153 6.75425 9.38756 7.39164 10.1289L9.28977 12.3366C9.60639 12.7048 10.0679 12.9167 10.5535 12.9167H14.9488" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="11.433" y1="8.98301" x2="12.3163" y2="8.98301" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M4.53223 4.16634V3.74967C4.53223 2.8292 5.27842 2.08301 6.19889 2.08301H16.1989C17.1194 2.08301 17.8656 2.8292 17.8656 3.74967V13.7497C17.8656 14.6701 17.1194 15.4163 16.1989 15.4163H15.7822" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_16952">
      <rect width="20" height="20" fill="white"/>
    </clipPath>
  </defs></svg>,
  label:"Gallery",href:"/gallery"
    },
  ]






  const BottomNavLinks=[
    {icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 9.16634V9.17467M6.66667 9.16634V9.17467M13.3333 9.16634V9.17467M15 3.33301C15.663 3.33301 16.2989 3.5964 16.7678 4.06524C17.2366 4.53408 17.5 5.16997 17.5 5.83301V12.4997C17.5 13.1627 17.2366 13.7986 16.7678 14.2674C16.2989 14.7363 15.663 14.9997 15 14.9997H10.8333L6.66667 17.4997V14.9997H5C4.33696 14.9997 3.70107 14.7363 3.23223 14.2674C2.76339 13.7986 2.5 13.1627 2.5 12.4997V5.83301C2.5 5.16997 2.76339 4.53408 3.23223 4.06524C3.70107 3.5964 4.33696 3.33301 5 3.33301H15Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>,label:"Share feedback",href:"/feedback"},
    {icon:<svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M8.60417 3.5975C8.95917 2.13417 11.0408 2.13417 11.3958 3.5975C11.4491 3.81733 11.5535 4.02148 11.7006 4.19333C11.8477 4.36518 12.0332 4.49988 12.2422 4.58645C12.4512 4.67303 12.6776 4.70904 12.9032 4.69156C13.1287 4.67407 13.3469 4.60359 13.54 4.48583C14.8258 3.7025 16.2983 5.17417 15.515 6.46083C15.3974 6.65388 15.327 6.87195 15.3096 7.09731C15.2922 7.32267 15.3281 7.54897 15.4146 7.75782C15.5011 7.96666 15.6356 8.15215 15.8073 8.29921C15.9789 8.44627 16.1829 8.55075 16.4025 8.60417C17.8658 8.95917 17.8658 11.0408 16.4025 11.3958C16.1827 11.4491 15.9785 11.5535 15.8067 11.7006C15.6348 11.8477 15.5001 12.0332 15.4135 12.2422C15.327 12.4512 15.291 12.6776 15.3084 12.9032C15.3259 13.1287 15.3964 13.3469 15.5142 13.54C16.2975 14.8258 14.8258 16.2983 13.5392 15.515C13.3461 15.3974 13.1281 15.327 12.9027 15.3096C12.6773 15.2922 12.451 15.3281 12.2422 15.4146C12.0333 15.5011 11.8479 15.6356 11.7008 15.8073C11.5537 15.9789 11.4492 16.1829 11.3958 16.4025C11.0408 17.8658 8.95917 17.8658 8.60417 16.4025C8.5509 16.1827 8.44648 15.9785 8.29941 15.8067C8.15233 15.6348 7.96676 15.5001 7.75779 15.4135C7.54882 15.327 7.32236 15.291 7.09685 15.3084C6.87133 15.3259 6.65313 15.3964 6.46 15.5142C5.17417 16.2975 3.70167 14.8258 4.485 13.5392C4.60258 13.3461 4.67296 13.1281 4.6904 12.9027C4.70785 12.6773 4.67187 12.451 4.58539 12.2422C4.49892 12.0333 4.36438 11.8479 4.19273 11.7008C4.02107 11.5537 3.81714 11.4492 3.5975 11.3958C2.13417 11.0408 2.13417 8.95917 3.5975 8.60417C3.81733 8.5509 4.02148 8.44648 4.19333 8.29941C4.36518 8.15233 4.49988 7.96676 4.58645 7.75779C4.67303 7.54882 4.70904 7.32236 4.69156 7.09685C4.67407 6.87133 4.60359 6.65313 4.48583 6.46C3.7025 5.17417 5.17417 3.70167 6.46083 4.485C7.29417 4.99167 8.37417 4.54333 8.60417 3.5975Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M7.5 10C7.5 10.663 7.76339 11.2989 8.23223 11.7678C8.70107 12.2366 9.33696 12.5 10 12.5C10.663 12.5 11.2989 12.2366 11.7678 11.7678C12.2366 11.2989 12.5 10.663 12.5 10C12.5 9.33696 12.2366 8.70107 11.7678 8.23223C11.2989 7.76339 10.663 7.5 10 7.5C9.33696 7.5 8.70107 7.76339 8.23223 8.23223C7.76339 8.70107 7.5 9.33696 7.5 10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>,label:"Settings",href:"/settings"}
  ]





  return (
    <div className={`bg-surface-weak h-full flex flex-col transition-[width] duration-200 ease-in-out ${iscollapsed ? "w-[72px]" : "w-[214px]"}`}>
      {/* ...topBar... */}
      <div className={`w-full h-[60px] bg-surface-weak  flex border-b border-line-sub items-center ${iscollapsed ? "justify-center" : "justify-between px-[16px]"}`}>

      <div className={`flex flex-row gap-[6px] px-[4px] items-center justify-center  ${iscollapsed ?"hidden" : ""}`}>

        <div className="p-[6px]">
         <Link href="/"> <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="4" fill="white"/>
          <path d="M4.4707 15.0966H5.11369C6.70483 15.0966 7.5004 15.0966 8.1556 14.7183C8.8108 14.3401 9.20859 13.6511 10.0042 12.2731L11.4524 9.76465" stroke="#101214" strokeWidth="1.64706" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.2944 4.23535C13.2944 4.23535 13.4112 5.32593 13.8664 5.78104C14.3215 6.23616 15.4121 6.353 15.4121 6.353C15.4121 6.353 14.3215 6.46984 13.8664 6.92496C13.4112 7.38007 13.2944 8.47065 13.2944 8.47065C13.2944 8.47065 13.1776 7.38007 12.7224 6.92496C12.2673 6.46984 11.1768 6.353 11.1768 6.353C11.1768 6.353 12.2673 6.23616 12.7224 5.78104C13.1776 5.32593 13.2944 4.23535 13.2944 4.23535Z" fill="#101214" stroke="#101214" strokeWidth="0.352941" strokeLinejoin="round"/>
          </svg></Link>
        </div>
         <p className="text-strong text-[16px] font-medium">Foldrise</p>
      </div>

      {/* ....SidebarCollpasedIcon...... */}
      <div onClick={()=>toggleCollapsed()} className={`p-[6px] aspect-square cursor-pointer  items-center justify-center group hover:bg-surface-light shrink-0 rounded-[8px] ${iscollapsed ? "" : "p-[6px]"}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-soft group-hover:text-strong">
         <path d="M7.4987 3.33203V16.6654M12.4987 8.33203L10.832 9.9987L12.4987 11.6654M3.33203 4.9987C3.33203 4.55667 3.50763 4.13275 3.82019 3.82019C4.13275 3.50763 4.55667 3.33203 4.9987 3.33203H14.9987C15.4407 3.33203 15.8646 3.50763 16.1772 3.82019C16.4898 4.13275 16.6654 4.55667 16.6654 4.9987V14.9987C16.6654 15.4407 16.4898 15.8646 16.1772 16.1772C15.8646 16.4898 15.4407 16.6654 14.9987 16.6654H4.9987C4.55667 16.6654 4.13275 16.4898 3.82019 16.1772C3.50763 15.8646 3.33203 15.4407 3.33203 14.9987V4.9987Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      </div>

      {/* ....BottomBar.... */}
      <div className="items-center flex flex-col justify-between relative w-full flex-1 min-h-0 border-r border-line-sub">
        
              {/* ........TOP LINKS......... */}
      <div className="w-full p-[16px]  bg-surface-weak  flex flex-col items-center justify-center gap-[4px] ">
        {TopNavLinks.map((link)=>{
          const isActive=pathname===link.href;
      
          return(
            
             <Link key={link.href} href={link.href} className={`w-full relative cursor-pointer py-[8px] group px-[10px] flex items-center   rounded-[10px] ${isActive?"bg-surface-soft":" hover:bg-surface-alpha-light-soft"} ${iscollapsed?"justify-center gap-0":"gap-[8px]"}`}>
             <i className={`shrink-0 ${isActive?"text-strong":"text-sub group-hover:text-strong"} `}>{link.icon}</i>
             <p className={`text-paragraph-sm  ${isActive?"text-strong":"text-sub group-hover:text-strong"}  ${iscollapsed ? "hidden" : ""}`}>{link.label}</p>
            {iscollapsed && (
              <div className='absolute items-center text-nowrap  justify-center left-full ml-[20px] transition-opacity text-white text-label-xs bg-surface-light duration-150  pointer-events-none bg-green-300 px-[6px] py-[4px] rounded-[6px] opacity-0 group-hover:opacity-100 '>
                {link.label}
              </div>
            )

             }
             </Link>
         
            
          )
        })}

      </div>
      {/* ........BOTTOM LINKS......... */}
      <div className="w-full bg-surface-weak p-[16px] flex flex-col items-center justify-center gap-[4px] ">
        {BottomNavLinks.map((link)=>{
             const isActive=pathname===link.href;
          return(
               <Link key={link.href} href={link.href} className={`w-full  py-[8px] px-[10px] relative cursor-pointer group flex items-center   ${isActive?"bg-surface-soft":" hover:bg-surface-alpha-light-soft"} rounded-[10px] ${iscollapsed?"justify-center gap-0":"gap-[8px]"}`}>
              <i className={`shrink-0 ${isActive?"text-strong":"text-sub group-hover:text-strong"} `}>{link.icon}</i>
              <p className={`text-paragraph-sm whitespace-nowrap ${isActive?"text-strong":"text-sub group-hover:text-strong"}   ${iscollapsed ? "hidden" : ""}`}>{link.label}</p>
                   {iscollapsed && (
              <div className='absolute items-center text-nowrap justify-center left-full ml-[20px] transition-opacity text-white text-label-xs bg-surface-light duration-150  pointer-events-none bg-green-300 px-[6px] py-[4px] rounded-[6px] opacity-0 group-hover:opacity-100 '>
                {link.label}
              </div>
            )

             }
             </Link>
          )
        })}
      </div>
       
      </div>

      </div>
  )
}

export default Sidebar