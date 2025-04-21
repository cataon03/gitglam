'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Montserrat } from 'next/font/google'; 

const montserrat = Montserrat({ subsets: ['latin'] }); 

export default function Home() {

  //state variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showYesPopup, setShowYesPopup] = useState(false); // New state variable
  const [noClickCount, setNoClickCount] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState({ left: '0', top: '0' });
  const [showNoPopup, setShowNoPopup] = useState(false);
  const [bibbleImages, setBibbleImages] = useState<any[]>([]);
  const noSoundRef = useRef<HTMLAudioElement>(null); // Added ref for audio
  const [showSideEye, setShowSideEye] = useState(false);
  const yesButtonRef = useRef<HTMLButtonElement>(null); // Ref for Yes button


  //reset form if submitted or open page
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setResponse("");
    setNoClickCount(0);
    setSubmitted(false); 
    setShowYesPopup(false);
    setShowNoPopup(false);
    setNoButtonPosition({ left: '0', top: '0' }); 
  };
  
  //handle submission
  const handleSubmit = async (e: React.FormEvent, responseOverride?: string) => {
    e.preventDefault();
  
    const finalResponse = responseOverride || response;

    const rsvpData = { FirstName: firstName.toLowerCase(), LastName: lastName.toLowerCase(), RSVP: finalResponse };
  
    try {
      //check to see user has already rsvp'd
      const checkRes = await fetch(`/api/rsvp?first=${encodeURIComponent(firstName.toLowerCase())}&last=${encodeURIComponent(lastName.toLowerCase())}`);
      const data = await checkRes.json();
          
      //updating only
      if (data.exists === 1) {
        const res = await fetch('/api/rsvp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rsvpData),
        });
  
        if (res.ok) {
          if (finalResponse === "Yes") {
            setShowYesPopup(true);
          } else {
            setShowNoPopup(true);
          }
        } else {
          const errorText = await res.text(); 
          console.error('Error updating RSVP:', errorText);
        }
      } else { //create rsvp
       
        const res = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rsvpData),
        });
  
        if (res.ok) {
          if (finalResponse === "Yes") {
            setShowYesPopup(true);
          } else {
            setShowNoPopup(true);
          }
        } else {
          const errorText = await res.text(); 
           console.error('Error updating RSVP:', errorText); 
        }
      }
    } catch (error) {
      console.error('Error handling RSVP:', error);
    }
  
    setFirstName("");
    setLastName("");
    setResponse("");
  };

  //keep count of how many clicks -> show block
  const handleNoClick = async () => {
    const moveDistance = 100; 
    
    if (noClickCount < 2) {
      setNoClickCount(noClickCount + 1);
      setNoButtonPosition({
        left: `${Math.floor(Math.random() * moveDistance)}px`,
        top: `${Math.floor(Math.random() * moveDistance)}px`,
      });

      if (noClickCount === 1) {
        setShowSideEye(true);
      }

    } else if (noClickCount === 2) {
      setShowSideEye(false); 
      setNoClickCount(noClickCount + 1);
      setResponse("No");
      await handleSubmit({ preventDefault: () => {} } as React.FormEvent, "No");
  
      setShowNoPopup(true); 
    } else {
      setShowNoPopup(true); 
    }
  };

  //useffect to run the styles insertion and generate falling Bibble images on initial render
  useEffect(() => {
    const styles = `
      @keyframes fall {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
      .animate-fall { animation: fall 10s linear infinite; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const images = Array.from({ length: 10 }, (_, index) => ({
      key: index,
      src: `/bibble${(index % 3) + 1}.png`,
      style: {
        position: 'absolute',
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 5 + 5}s`,
        animationDelay: `${Math.random() * 5}s`
      }
    }));
    setBibbleImages(images);
  }, []);

  useEffect(() => {
    const tryPlay = () => {
      noSoundRef.current?.play().catch((err) => {
        console.warn("Autoplay failed (user interaction required)", err);
      });
    };

    // Try autoplay once mounted
    tryPlay();

    // As fallback, wait for user interaction to trigger play
    window.addEventListener('click', tryPlay, { once: true });

    return () => {
      window.removeEventListener('click', tryPlay);
    };
  }, []);

  return (
    <div className={`relative grid grid-rows-[auto_1fr_auto] bg-[#c6dbef] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] ${montserrat.className}`}>
      <audio ref={noSoundRef} src="/barbie-music.mp3" preload="auto" loop className="hidden" />      <div className="absolute inset-0 z-0 overflow-hidden">
        {bibbleImages.map((img) => (
          <Image
            key={img.key}
            src={img.src}
            alt="falling bibble"
            className="animate-fall"
            width={180}
            height={38}
            style={img.style}
          />
        ))}
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-lg mx-auto z-10">
        {/* Form for RSVP */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center sm:items-start bg-white p-8 rounded-xl shadow-lg">
            <div className="bg-white p-4 rounded-lg text-center">
              <h2 className="text-2xl text-center font-semibold mb-4 text-black">RSVP - Barbie Night</h2>

              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-gray-300 p-2 rounded w-48 text-black bg-white"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border border-gray-300 p-2 rounded w-48 text-black bg-white"
              />
            </div>

            <div className="flex gap-4 mb-4 mx-auto">

              <button
                type="submit"
                onClick={() => setResponse("Yes")}
                className="p-2 rounded bg-[#6eb1d6] text-black"
              >
                Yes
              </button>

              <button
                type="button"
                onClick={handleNoClick}
                style={{ position: 'relative', left: noClickCount < 5 ? noButtonPosition.left : undefined, top: noClickCount < 5 ? noButtonPosition.top : undefined }}
                className="p-2 rounded bg-[#6eb1d6] text-black"
              >
                No
              </button>

            </div>
          </form>
        ) : (
          <></>
        )}
      </main>

      {showSideEye && (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)', 
      zIndex: 30,
    }}
  >
    <Image
      src="/side-eye.gif"
      alt="side eye"
      width={80}
      height={80}
      className="rounded"
    />
  </div>
)}
      {showNoPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
          <p className = "text-center text-[#4CBB17]"> Thank you for your response!</p>
            <hr className="my-4 border-t-2 border-[#6eb1d6]" /> 
            <h2 className="text-xl text-black font-semibold text-center"> Hope You Can Make It to the Next Barbie Night!</h2>
            <button 
              onClick={resetForm} 
              className="mt-4 p-2 bg-[#6eb1d6] text-black rounded block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showYesPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
            <p className = "text-center text-[#4CBB17]"> Thank you for your response!</p>
            <hr className="my-4 border-t-2 border-[#6eb1d6]" />
            <h2 className="text-xl font-semibold text-black text-center mb-2">🎀 Barbie Night Details 🎀</h2>
            <p className="text-center text-black">📍 The Retreat West</p>
            <p className="text-center text-black mb-4">🕖 Thursday @ 7:45 PM</p>
            <button 
              onClick={resetForm} 
              className="mt-4 px-4 py-2 bg-[#6eb1d6] text-black rounded block mx-auto"
             >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}