'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOptionSelection } from '@/app/context/option-selection-context';

const ALL_OPTION_KEYS = ["face", "bodyType", "top", "bottom", "footwear", "pose", "background", "aspectRatio"];

const SideDrawer = () => {
  const pathname = usePathname();
  const router = useRouter();

  const ModelOptions=[
    {
      icon:<svg  width="32" height="32" viewBox="0 0 32 32" fill="none">
  <g clipPath="url(#clip0_2002_14266)">
    <path d="M13.333 13.3333L8.66634 10C7.57306 11.7301 6.85318 12.9873 6.66634 15.3333L5.99967 15.3333C5.63149 15.3333 5.33301 15.6318 5.33301 16V17.7687C5.33301 18.6328 6.03351 19.3333 6.89762 19.3333C7.74733 24.1479 11.9997 28.6667 15.9997 28.6667C19.8056 28.6667 23.84 24.5757 24.9545 20.0315C25.0528 19.6305 25.3288 19.3333 25.7416 19.3333C26.2115 19.3333 26.6663 18.9524 26.6663 18.4825V16.5999C26.6663 15.9004 26.0993 15.3333 25.3997 15.3333C25.2037 15.3333 25.0104 15.2878 24.835 15.2005L18.3043 11.9473C17.5311 11.5622 16.6192 11.5754 15.8574 11.9829L13.333 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25.3313 14.6663C28.2803 9.65302 24.6656 3.33301 18.8492 3.33301H12.5766C7.10077 3.33301 3.76243 9.3562 6.6646 13.9997" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="15.0732" y1="23.2783" x2="16.9066" y2="23.2783" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_14266">
      <rect width="32" height="32" fill="white"/>
    </clipPath>
  </defs>
      </svg>,label:"Face",href:"/faceModal",key:"face"
    },
    {icon:"Auto",label:"Body type",href:"/bodyTypeModal",key:"bodyType"}

  ]

  const OutfitOptions=[
    {icon:<svg  width="32" height="32" viewBox="0 0 32 32" fill="none">
  <g clipPath="url(#clip0_2002_14294)">
    <path d="M20 4.66699L26.1766 6.72586C27.2655 7.08883 28 8.10787 28 9.25568V11.3337C28 12.8064 26.8061 14.0003 25.3333 14.0003H24V26.0003C24 26.3539 23.8595 26.6931 23.6095 26.9431C23.3594 27.1932 23.0203 27.3337 22.6667 27.3337H9.33333C8.97971 27.3337 8.64057 27.1932 8.39052 26.9431C8.14048 26.6931 8 26.3539 8 26.0003V14.0003H6.66667C5.19391 14.0003 4 12.8064 4 11.3337V9.25568C4 8.10787 4.73448 7.08883 5.82339 6.72586L12 4.66699C12 5.72786 12.4214 6.74527 13.1716 7.49542C13.9217 8.24556 14.9391 8.66699 16 8.66699C17.0609 8.66699 18.0783 8.24556 18.8284 7.49542C19.5786 6.74527 20 5.72786 20 4.66699Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="15.082" y1="13.4941" x2="16.9154" y2="13.4941" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_14294">
      <rect width="32" height="32" fill="white"/>
    </clipPath>
  </defs>
</svg>,label:"Top",href:"/topModal",key:"top"},
{icon:<svg  width="32" height="32" viewBox="0 0 32 32" fill="none">
  <g clipPath="url(#clip0_2002_14311)">
    <path d="M7.01223 6.2802C7.20404 4.97069 8.32726 4 9.65075 4H22.3609C23.6849 4 24.8084 4.97148 24.9996 6.28165L27.5547 23.7936C27.7895 25.4026 26.542 26.8453 24.916 26.8453H19.9841C18.8065 26.8453 17.7683 26.0729 17.4299 24.9449L16 20.1786L14.5701 24.9449C14.2317 26.0729 13.1935 26.8453 12.0159 26.8453H7.08572C5.45911 26.8453 4.21146 25.4016 4.4472 23.7922L7.01223 6.2802Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="6.66699" y1="8.58301" x2="25.3337" y2="8.58301" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="15.75" y1="8.75" x2="15.75" y2="12.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_14311">
      <rect width="32" height="32" fill="white"/>
    </clipPath>
  </defs>
</svg>,label:"Bottom",href:"/bottomModal",key:"bottom"},
{icon:<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
  <g clipPath="url(#clip0_2002_14329)">
    <path d="M9.21352 13.3837H11.3347C12.0849 13.3837 12.693 12.7756 12.693 12.0254C12.693 11.2752 13.3012 10.667 14.0514 10.667H15.2388C16.14 10.667 16.9712 11.146 17.5039 11.8729C18.4647 13.1841 20.1709 15.161 22.0264 15.667C22.6542 15.8382 23.4532 15.8668 24.1717 15.8418C25.2906 15.803 26.3925 16.3154 26.9429 17.2904L28.2941 19.6837C29.0469 21.017 28.0836 22.667 26.5525 22.667H5.35068C3.64468 22.667 2.37743 21.0872 2.74751 19.4218L4.3877 12.041C4.5661 11.2382 5.27815 10.667 6.10053 10.667H6.49677C7.24698 10.667 7.85514 11.2752 7.85514 12.0254C7.85514 12.7756 8.46331 13.3837 9.21352 13.3837Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <line x1="5.87012" y1="19.3623" x2="7.70345" y2="19.3623" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_14329">
      <rect width="32" height="32" fill="white"/>
    </clipPath>
  </defs>
</svg>,label:"Footwear",href:"/footwearModal",key:"footwear"}
  ]

  const ShootOptions=[
    {icon:<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M6.66699 26.6663L13.3337 25.9997L16.7943 19.6687M24.0003 26.6663V19.9997H16.667L20.0003 11.333L12.667 12.6663L14.667 15.333M20.0003 6.66634C20.0003 7.01996 20.1408 7.3591 20.3909 7.60915C20.6409 7.8592 20.98 7.99967 21.3337 7.99967C21.6873 7.99967 22.0264 7.8592 22.2765 7.60915C22.5265 7.3591 22.667 7.01996 22.667 6.66634C22.667 6.31272 22.5265 5.97358 22.2765 5.72353C22.0264 5.47348 21.6873 5.33301 21.3337 5.33301C20.98 5.33301 20.6409 5.47348 20.3909 5.72353C20.1408 5.97358 20.0003 6.31272 20.0003 6.66634Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>,label:"Pose",href:"/poseModal",key:"pose"},
    {icon:<svg  width="32" height="32" viewBox="0 0 32 32" fill="none">
  <g clipPath="url(#clip0_2002_14358)">
    <rect x="4" y="4" width="24" height="24" rx="2.66667" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path opacity="0.9" d="M4.48438 21.3325L9.05687 16.3265C9.97276 15.3237 11.4959 15.1695 12.5943 15.9682L19.2691 20.8225C19.7249 21.154 20.274 21.3325 20.8375 21.3325L26.9949 21.3325" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line opacity="0.9" x1="20.083" y1="12.8828" x2="21.9163" y2="12.8828" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
  <defs>
    <clipPath id="clip0_2002_14358">
      <rect width="32" height="32" fill="white"/>
    </clipPath>
  </defs>
    </svg>,label:"Background",href:"/backgroundModal",key:"background"},
    {icon:<svg  width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M8 7.99967C8 7.29243 8.28095 6.61415 8.78105 6.11406C9.28115 5.61396 9.95942 5.33301 10.6667 5.33301H21.3333C22.0406 5.33301 22.7189 5.61396 23.219 6.11406C23.719 6.61415 24 7.29243 24 7.99967V23.9997C24 24.7069 23.719 25.3852 23.219 25.8853C22.7189 26.3854 22.0406 26.6663 21.3333 26.6663H10.6667C9.95942 26.6663 9.28115 26.3854 8.78105 25.8853C8.28095 25.3852 8 24.7069 8 23.9997V7.99967Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,label:"Aspect ratio",href:"/AspectratioModal",key:"aspectRatio"}

  ]
  const [isselected, setisselected] = useState(false)
  const { selections } = useOptionSelection();
  const allOptionsSelected = ALL_OPTION_KEYS.every((k) => k in selections);

  // The route can take a beat to actually swap (server round-trip, dev-mode
  // compile, etc). Highlighting the clicked item immediately — instead of
  // waiting for `pathname` to catch up — makes the click feel acknowledged
  // right away instead of like nothing happened.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
     <div className='w-[360px] flex flex-col relative'>
      <div className='w-full bg-surface-weak flex-1 min-h-0 px-[16px] pt-[20px] gap-[28px] border-l border-line-sub flex flex-col'>

      {/* ...................TopOptionsbar............... */}
      <div className=" w-full flex-1 bg-surface-weak min-h-0 pb-[28px] overflow-y-scroll no-scrollbar  flex flex-col gap-[20px]">
        {/* ............Model............. */}
        <div className='w-full flex flex-col  gap-[16px]'>
        <p className='px-[16px] text-subheading-xs text-soft uppercase w-full '>Model</p>
        <div className=' flex flex-col w-full gap-[12px]'>
          {ModelOptions.map((data)=>{
            const selected=pathname===data.href || pendingHref===data.href;
            const selection = data.key ? selections[data.key] : undefined;
            return(
              <Link key={data.label} href={data.href} onClick={() => setPendingHref(data.href)} className={`rounded-[16px] p-[16px] flex gap-[16px] border border-line-sub flex-row items-center transition-colors duration-100 ease-out ${selected?"bg-surface-soft":"bg-surface-weak hover:border-transparent hover:bg-surface-alpha-light-soft"}`}>
               <div className='h-[48px] w-[48px] relative overflow-hidden items-center justify-center flex text-label-xs rounded-[10px] bg-surface-alpha-light-white text-sub'>
                {selection?.color ? (
                  <div className="w-full h-full" style={{ background: selection.color }} />
                ) : selection?.ratio ? (
                  <div
                    className="bg-surface-mid rounded-[3px]"
                    style={{
                      width: selection.ratio >= 1 ? 28 : 28 * selection.ratio,
                      height: selection.ratio >= 1 ? 28 / selection.ratio : 28,
                    }}
                  />
                ) : selection?.image ? (
                  <Image src={selection.image} alt={data.label} fill unoptimized={typeof selection.image === "string"} className="object-cover" />
                ) : (
                  <div className="p-[8px] w-full h-full items-center justify-center flex">{data.icon}</div>
                )}
               </div>
                <p className='text-paragraph-sm text-[#FFFFFF]'>{data.label}</p>
              </Link>
            )
})}
        </div>
        </div>


       {/* .............OUTFIT................. */}
     <div className='w-full bg-surface-weak flex flex-col  gap-[16px]'>
        <p className='px-[16px] text-subheading-xs text-soft uppercase w-full '>Outfit</p>
        <div className=' flex flex-col w-full gap-[12px]'>
          {OutfitOptions.map((data)=>{
             const selected=pathname===data.href || pendingHref===data.href;
             const selection = data.key ? selections[data.key] : undefined;
            return(
              <Link key={data.label} href={data.href} onClick={() => setPendingHref(data.href)} className={`rounded-[16px] p-[16px] transition-colors duration-100 ease-out flex gap-[16px] border border-line-sub flex-row items-center ${selected?"bg-surface-soft":"bg-surface-weak hover:border-transparent hover:bg-surface-alpha-light-soft"}`}>
               <div className='h-[48px] w-[48px] relative overflow-hidden items-center justify-center flex text-label-xs rounded-[10px]  bg-surface-alpha-light-white text-sub'>
                {selection?.color ? (
                  <div className="w-full h-full" style={{ background: selection.color }} />
                ) : selection?.ratio ? (
                  <div
                    className="bg-surface-mid rounded-[3px]"
                    style={{
                      width: selection.ratio >= 1 ? 28 : 28 * selection.ratio,
                      height: selection.ratio >= 1 ? 28 / selection.ratio : 28,
                    }}
                  />
                ) : selection?.image ? (
                  <Image src={selection.image} alt={data.label} fill unoptimized={typeof selection.image === "string"} className="object-cover" />
                ) : (
                  <div className="p-[8px] w-full h-full items-center justify-center flex">{data.icon}</div>
                )}
               </div>
                <p className='text-paragraph-sm text-[#FFFFFF]'>{data.label}</p>
              </Link>
            )
})}
        </div>
        </div>

      {/* .................SHOOT......................... */}
     <div className='w-full flex flex-col  gap-[16px]'>
        <p className='px-[16px] text-subheading-xs text-soft uppercase w-full'>Shoot</p>
        <div className=' flex flex-col w-full gap-[12px]'>
          {ShootOptions.map((data)=>{
             const selected=pathname===data.href || pendingHref===data.href;
             const selection = data.key ? selections[data.key] : undefined;
            return(
              <Link key={data.label} href={data.href} onClick={() => setPendingHref(data.href)} className={`rounded-[16px] p-[16px]  transition-colors duration-100 ease-out flex gap-[16px] border border-line-sub flex-row items-center ${selected?"bg-surface-soft":"bg-surface-weak hover:border-transparent hover:bg-surface-alpha-light-soft"}`}>
               <div className='h-[48px] w-[48px] relative overflow-hidden items-center justify-center flex text-label-xs rounded-[10px]  bg-surface-alpha-light-white text-sub'>
                {selection?.color ? (
                  <div className="w-full h-full" style={{ background: selection.color }} />
                ) : selection?.ratio ? (
                  <div
                    className="bg-surface-mid rounded-[3px]"
                    style={{
                      width: selection.ratio >= 1 ? 28 : 28 * selection.ratio,
                      height: selection.ratio >= 1 ? 28 / selection.ratio : 28,
                    }}
                  />
                ) : selection?.image ? (
                  <Image src={selection.image} alt={data.label} fill unoptimized={typeof selection.image === "string"} className="object-cover" />
                ) : (
                  <div className="p-[8px] w-full h-full items-center justify-center flex">{data.icon}</div>
                )}
               </div>
                <p className='text-paragraph-sm text-[#FFFFFF]'>{data.label}</p>
              </Link>
            )
})}
        </div>
        </div>
      </div>

      
    

      </div>

      <div className='w-full'>
          {/* ...........Bottom Generate Area......... */}
      <div className="p-[16px] border-t border-l bg-surface-weak border-line-sub w-full h-[80px]">
      <button
        onClick={() => allOptionsSelected && router.push('/generate?generating=1')}
        disabled={!allOptionsSelected}
        className='p-btn-righticon-48 flex flex-row items-center justify-center w-full'
      >
        <p className='text-label-sm px-[4px]'>Generate</p>

        <div className='flex flex-row items-center justify-center gap-[2px]'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
           <path d="M13.2699 0.12942C13.2616 0.0557573 13.1993 7.58744e-05 13.1251 7.71494e-08C13.051 -7.55636e-05 12.9886 0.0554785 12.9801 0.129124C12.8935 0.880068 12.6676 1.41987 12.2937 1.79374C11.9199 2.16761 11.3801 2.39351 10.6291 2.48013C10.5555 2.48862 10.4999 2.55102 10.5 2.62515C10.5001 2.69928 10.5558 2.76156 10.6294 2.76991C11.3682 2.85359 11.9188 3.07935 12.301 3.45466C12.6823 3.82909 12.9133 4.36934 12.9797 5.11707C12.9864 5.19238 13.0496 5.25008 13.1252 5.25C13.2008 5.24992 13.2638 5.19207 13.2703 5.11674C13.334 4.381 13.5647 3.83011 13.9474 3.44742C14.3301 3.06474 14.881 2.83398 15.6167 2.77029C15.6921 2.76377 15.7499 2.70077 15.75 2.62516C15.7501 2.54956 15.6924 2.48643 15.6171 2.47974C14.8693 2.41332 14.3291 2.18231 13.9547 1.80099C13.5794 1.41877 13.3536 0.868216 13.2699 0.12942Z" fill="currentColor"/>
           <path d="M7.12262 2.58279C7.10116 2.39338 6.94101 2.2502 6.75038 2.25C6.55975 2.24981 6.39931 2.39266 6.37747 2.58203C6.15475 4.51303 5.57387 5.90109 4.61248 6.86248C3.65109 7.82387 2.26303 8.40475 0.332033 8.62747C0.142659 8.64931 -0.000194306 8.80975 1.98385e-07 9.00038C0.000195106 9.19101 0.143376 9.35116 0.332794 9.37262C2.23255 9.5878 3.64827 10.1683 4.63111 11.1334C5.61166 12.0962 6.20567 13.4854 6.37647 15.4082C6.39367 15.6018 6.55601 15.7502 6.75042 15.75C6.94483 15.7498 7.10684 15.601 7.1236 15.4073C7.28737 13.5154 7.88076 12.0989 8.8648 11.1148C9.84885 10.1308 11.2654 9.53737 13.1573 9.3736C13.351 9.35684 13.4998 9.19483 13.5 9.00042C13.5002 8.80601 13.3518 8.64367 13.1582 8.62647C11.2354 8.45568 9.84624 7.86166 8.88341 6.88111C7.91834 5.89827 7.3378 4.48255 7.12262 2.58279Z" fill="currentColor"/>
           </svg>
          <p className='text-label-sm px-[4px]'>24</p>
        </div>
      </button>
      </div>
      </div>
   
     </div>
  )
}

export default SideDrawer