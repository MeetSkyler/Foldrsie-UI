"use client";
import { useEffect, useState } from 'react';
import modalimg from '@/public/modalimg.svg'
import dummyResult from '@/public/mainPerson.png'
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOptionSelection } from '@/app/context/option-selection-context';
import { useGenerations, GenerationItem } from '@/app/context/generations-context';

const CARD_MAX_W = 370;
const CARD_MAX_H = 440;
const THUMB_MAX = 64;

function fitBox(ratio: number, maxW: number, maxH: number) {
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { width: w, height: h };
}

const Page = () => {
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get('generating') === '1';
  const { selections } = useOptionSelection();
  const { generations, addGeneration } = useGenerations();
  const ratio = selections.aspectRatio?.ratio ?? 3 / 4;

  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;
    setPhase('loading');
    // Dummy 3s stand-in for the real generation API — swap the timeout +
    // dummyResult for the actual request/response once it's wired up.
    const timer = setTimeout(() => {
      const newItem: GenerationItem = { id: `gen-${Date.now()}`, image: dummyResult.src, ratio };
      addGeneration(newItem);
      setViewingId(newItem.id);
      setPhase('done');
    }, 6000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  if (!isGenerating) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-neutral-900'>
        <div className='relative w-[377.129px] h-[492.625px] aspect-[49/64] items-center flex mb-[80px] justify-center'>
          <Image src={modalimg} alt="Model shot preview" fill className='object-cover' />
          <div className='absolute h-[76px]  -bottom-[36px] flex flex-col items-center justify-center gap-[8px]'>
            <p className='text-title-h6 text-strong'>Create your model shot</p>
            <p className='text-center text-sub text-paragraph-sm'>Select your options from the right to <br /> create your shot.</p>
          </div>
        </div>
      </div>
    );
  }

  const card = fitBox(ratio, CARD_MAX_W, CARD_MAX_H);
  const thumb = fitBox(ratio, THUMB_MAX, THUMB_MAX);
  const viewing = generations.find((g) => g.id === viewingId) ?? generations[generations.length - 1];

  const total = generations.length;
  const showStrip = total >= 2;
  const showOverflow = total >= 5;
  const stripItems = showOverflow ? generations.slice(-5, -1) : generations.slice(-4);
  const latest = generations[total - 1];

  return (
    <div className='w-full h-full flex flex-col items-center justify-center bg-neutral-900 gap-[16px]'>
      {phase === 'loading' && (
        <div
          style={{ width: card.width, height: card.height }}
          className='relative rounded-[24px] overflow-hidden flex items-center justify-center bg-surface-soft'
        >
          <video
            src="/Generating.webm"
            autoPlay
            loop
            muted
            playsInline
            className='absolute inset-0 w-full h-full object-cover'
          />
          <p className='relative text-paragraph-sm text-strong flex items-center'>
            Generating
            <span className='loading-dot' style={{ animationDelay: '0s' }}>.</span>
            <span className='loading-dot' style={{ animationDelay: '0.2s' }}>.</span>
            <span className='loading-dot' style={{ animationDelay: '0.4s' }}>.</span>
          </p>
        </div>
      )}

      {phase === 'done' && viewing && (
        <>
          <div
            style={{ width: card.width, height: card.height }}
            className='relative rounded-[24px] overflow-hidden bg-surface-soft'
          >
            <Image src={viewing.image} alt="Generated result" fill unoptimized className='object-cover' />
            <div
              onClick={() => setFullscreen(true)}
              className='absolute top-[12px] right-[12px] w-[32px] h-[32px] rounded-[8px] bg-black-60 flex items-center justify-center cursor-pointer'
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H2V6M10 2H14V6M14 10V14H10M2 10V14H6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <button
            style={{ width: card.width }}
            className='h-[48px] rounded-[10px] bg-surface-light hover:bg-surface-mid text-label-sm text-strong cursor-pointer'
          >
            Download
          </button>

          {showStrip && (
            <div className='flex flex-row gap-[8px] items-end'>
              {stripItems.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setViewingId(g.id)}
                  style={{ width: thumb.width, height: thumb.height }}
                  className={`relative rounded-[10px] overflow-hidden cursor-pointer ${
                    g.id === viewing.id ? 'outline outline-2 outline-offset-1 outline-white' : ''
                  }`}
                >
                  <Image src={g.image} alt="" fill unoptimized className='object-cover' />
                </button>
              ))}

              {showOverflow && latest && (
                <Link
                  href="/gallery"
                  style={{ width: thumb.width, height: thumb.height }}
                  className='relative rounded-[10px] overflow-hidden flex items-center justify-center cursor-pointer'
                >
                  <Image src={latest.image} alt="" fill unoptimized className='object-cover opacity-40' />
                  <span className='relative text-label-xs text-white'>View all</span>
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {fullscreen && viewing && (
        <div
          onClick={() => setFullscreen(false)}
          className='fixed inset-0 z-50 bg-black-90 flex items-center justify-center'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='relative'
            style={{ width: '80vw', height: '80vh' }}
          >
            <Image src={viewing.image} alt="Generated result" fill unoptimized className='object-contain' />
            <div
              onClick={() => setFullscreen(false)}
              className='absolute -top-[48px] right-0 w-[36px] h-[36px] rounded-full bg-surface-light flex items-center justify-center text-strong cursor-pointer'
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
