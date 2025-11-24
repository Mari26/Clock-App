import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { RefreshCw, ArrowDown, ArrowUp, Sun, Moon } from 'lucide-react';

// --- მუდმივი ლოკალური მონაცემები ---
const LOCAL_QUOTES = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { content: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { content: "Truth can only be found in one place: the code.", author: "Robert C. Martin" },
  { content: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { content: "First, solve the problem. Then, write the code.", author: "John Johnson" }
];

// --- API კონფიგურაცია ---
// API-ის გასაღები და endpoint ლოკაციის დეტალების მისაღებად
const API_KEY = 'b0486bf2441a408dbfa4b47e19fc9ae9';
const TIME_API_URL = `https://api.ipgeolocation.io/timezone?apiKey=${API_KEY}`;


// დამხმარე ფუნქცია წელიწადის დღის გამოსათვლელად (1-366)
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// დამხმარე ფუნქცია კვირის ნომრის გამოსათვლელად (რაღაცის სტანდარტი)
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// დამხმარე ფუნქცია კვირის დღის მისაღებად (0=კვირა, 6=შაბათი)
const getDayName = (dayIndex) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};


const ClockApp = () => {
  const now = new Date();
  const [time, setTime] = useState(now);
  const [quote, setQuote] = useState(LOCAL_QUOTES[0]); 
  
  // (თუ API ვერ იმუშავებს)
  const defaultLocation = {
    city: 'Tbilisi',
    country: 'Georgia',
    timezone: 'Asia/Tbilisi', 
    dayOfYear: getDayOfYear(now), 
    dayOfWeek: now.getDay(), 
    weekNumber: getWeekNumber(now), 
    abbreviation: 'GET' // Georgian Time
  };

  const [locationData, setLocationData] = useState(defaultLocation);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // საათი და დღის დრო
  const hour = time.getHours();
  const isDaytime = hour >= 5 && hour < 18; 

  // ციტატის ლოგიკა 
  const fetchQuote = () => {
    const randomQuote = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
    setQuote(randomQuote);
  };

  // დროის მონაცემების წამოღება ახალი API-დან
  const fetchTimezoneData = async () => {
    try {
      const response = await axios.get(TIME_API_URL);
      const data = response.data;
      
      // API-დან მიღებული დეტალების დაყენება
      setLocationData({
        city: data.city || defaultLocation.city,
        country: data.country_name || defaultLocation.country,
        timezone: data.timezone || defaultLocation.timezone,
       
        dayOfYear: data.day_of_year || defaultLocation.dayOfYear,
        dayOfWeek: data.day_of_week || defaultLocation.dayOfWeek,
        weekNumber: data.week_number || defaultLocation.weekNumber,
        abbreviation: data.date_time_txt?.match(/\(([^)]+)\)$/)?.[1] || data.timezone_abbr || defaultLocation.abbreviation // ცდილობს აბრევიატურის ამოღებას
      });

    
      try {
        const remoteTime = new Date(data.date_time_wti);
        setTime(remoteTime);
      } catch (e) {
        console.error("Failed to parse remote time, using local time:", e);
        setTime(new Date()); 
      }

    } catch (error) {
      console.error("Timezone API Error. Using default (Tbilisi) location and local time:", error);
      setLocationData(defaultLocation);
      setTime(new Date()); 
    }
  };



  useEffect(() => {

     
    fetchQuote();
    

    fetchTimezoneData();


    
    const timer = setInterval(() => {
      const newTime = new Date();
      setTime(newTime);
      
      if (newTime.getSeconds() === 0) {
        setLocationData(prevData => ({
          ...prevData,
          dayOfYear: getDayOfYear(newTime),
          dayOfWeek: newTime.getDay(),
          weekNumber: getWeekNumber(newTime),
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ცარიელი მასივი ნიშნავს, რომ მხოლოდ ერთხელ გაეშვება

  // დროის ფორმატირება (HH:MM)
  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const getGreeting = () => {
    if (hour >= 5 && hour < 12) return "GOOD MORNING";
    if (hour >= 12 && hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };
  
  const dayImageUrl = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop";
  const nightImageUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop";


  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-white bg-black">
      
      <div className="absolute inset-0 z-0 w-full h-full">
        <img 
          src={isDaytime ? dayImageUrl : nightImageUrl}
          alt="ფონი"
          className="object-cover w-full h-full transition-opacity duration-1000 ease-in-out"
          onError={(e) => e.target.src = isDaytime 
            ? 'https://placehold.co/1000x1000/0077B6/FFFFFF?text=Day+Image' 
            : 'https://placehold.co/1000x1000/030712/FFFFFF?text=Night+Image'
          }
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className={`relative z-10 flex flex-col justify-between h-full px-6 py-8 md:px-16 md:py-16 lg:px-32 lg:py-20 transition-all duration-700 ease-in-out ${isExpanded ? 'transform -translate-y-[40vh] md:-translate-y-[40vh]' : ''}`}>
        
        <div className={`flex max-w-xl transition-opacity duration-500 ${isExpanded ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
          <div className="flex-1 pr-4">
            <>
              <p className="text-sm md:text-lg leading-relaxed font-light">
                "{quote.content}"
              </p>
              <h5 className="mt-4 font-bold text-sm md:text-base">
                {quote.author}
              </h5>
            </>
          </div>
          <button 
            onClick={fetchQuote} 
            className="self-start mt-1 transition-transform duration-500 hover:rotate-180 opacity-70 hover:opacity-100"
            title="ახალი ციტატა"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

       
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mt-auto">
          
    
          <div>
            <div className="flex items-center gap-3 mb-2 md:mb-4 tracking-[0.2em] text-sm md:text-lg uppercase">
              {isDaytime ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
              <span>{getGreeting()}, IT'S CURRENTLY</span>
            </div>
            
            <div className="flex items-baseline gap-4">
              <h1 className="text-[100px] leading-[1] md:text-[170px] lg:text-[200px] font-bold tracking-tighter">
                {formatTime(time)}
              </h1>
              <span className="text-lg md:text-4xl font-light uppercase">
                {locationData.abbreviation}
              </span>
            </div>
            
            <div className="mt-2 md:mt-4 text-lg md:text-2xl font-bold tracking-widest uppercase">
        
              {`IN ${locationData.city}, ${locationData.country}`}
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center gap-3 bg-white text-black pl-6 pr-2 py-2 md:pl-8 md:pr-3 md:py-3 rounded-full uppercase font-bold tracking-[0.2em] text-xs md:text-sm hover:text-gray-500 transition-colors"
            >
              <span>{isExpanded ? 'Less' : 'More'}</span>
              <div className="bg-gray-900 text-white rounded-full p-2 group-hover:bg-gray-600 transition-colors">
                 {isExpanded ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`absolute bottom-0 left-0 w-full bg-white/75 backdrop-blur-xl md:bg-white/90 text-gray-900 z-20 
        transition-transform duration-700 ease-in-out px-6 py-10 md:px-16 md:py-16 lg:px-32 lg:py-20
        ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '50vh' }}
      >

        <div className="w-full h-full flex flex-col md:flex-row gap-8 md:gap-0 max-w-6xl">
          
          <div className="flex-1 flex flex-col justify-center gap-8 md:gap-12 md:border-r md:border-gray-400/30">
            <div>
              <p className="text-[10px] md:text-[13px] tracking-[0.2em] uppercase font-normal mb-1 md:mb-2 text-gray-600">Current Timezone</p>
              <h3 className="text-xl md:text-4xl font-bold">{locationData.timezone}</h3>
            </div>
            <div>
              <p className="text-[10px] md:text-[13px] tracking-[0.2em] uppercase font-normal mb-1 md:mb-2 text-gray-600">Day of the year</p>
              <h3 className="text-xl md:text-4xl font-bold">{locationData.dayOfYear}</h3>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-8 md:gap-12 md:pl-20">
            <div>
              <p className="text-[10px] md:text-[13px] tracking-[0.2em] uppercase font-normal mb-1 md:mb-2 text-gray-600">Day of the week</p>
              <h3 className="text-xl md:text-4xl font-bold">{getDayName(locationData.dayOfWeek)}</h3>
            </div>
            <div>
              <p className="text-[10px] md:text-[13px] tracking-[0.2em] uppercase font-normal mb-1 md:mb-2 text-gray-600">Week number</p>
              <h3 className="text-xl md:text-4xl font-bold">{locationData.weekNumber}</h3>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ClockApp;