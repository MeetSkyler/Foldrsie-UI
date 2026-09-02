// ......MobileTopBar........//
// Dummy content for now — real logo/links/buttons will replace this.
import Link from 'next/link';

export default function MobileTopBar() {
  return (
    <div className="w-full h-full flex flex-row items-center justify-between px-[16px] pt-[12px]">
    <div className="flex flex-row gap-[8px]  items-center">
       <Link href="/"> <svg  width="32" height="32" viewBox="0 0 32 32" fill="none">
       <rect width="32" height="32" rx="6.4" fill="white"/>
       <path d="M7.15305 24.1549H8.18182C10.7276 24.1549 12.0006 24.1549 13.0489 23.5497C14.0972 22.9444 14.7337 21.8421 16.0066 19.6373L18.3238 15.6238" stroke="#101214" strokeWidth="2.63529" strokeLinecap="round" strokeLinejoin="round"/>
       <path d="M21.2708 6.77637C21.2708 6.77637 21.4577 8.52129 22.1859 9.24947C22.9141 9.97766 24.659 10.1646 24.659 10.1646C24.659 10.1646 22.9141 10.3515 22.1859 11.0797C21.4577 11.8079 21.2708 13.5528 21.2708 13.5528C21.2708 13.5528 21.0838 11.8079 20.3556 11.0797C19.6275 10.3515 17.8825 10.1646 17.8825 10.1646C17.8825 10.1646 19.6275 9.97766 20.3556 9.24947C21.0838 8.52129 21.2708 6.77637 21.2708 6.77637Z" fill="#101214" stroke="#101214" strokeWidth="0.564706" strokeLinejoin="round"/>
       </svg> </Link>
      <p className="text-strong text-[16px] font-medium ">Foldrise</p>
    </div>
    <div className=' flex flex-row gap-[8px] items-center'>
      <button className=" flex items-center justify-center text-label-sm s-btn-noicon-32 "><p className='px-[4px]'>Pricing</p></button>
      <Link href="" className="p-btn-noicon-32  text-label-sm  flex items-center justify-center">
      <p className='px-[4px]'> Try for free</p>
       </Link>
    </div>
    </div>
  );
}
