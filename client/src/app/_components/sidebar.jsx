"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWatchlistsDataStore } from '../zustand/useWatchlistsDataStore';
import io from "socket.io-client";
import Modal from './modal';

const Sidebar = () => {

   const [activeTab, setActiveTab] = useState('watchlists');
   const [activeWatchlist, setActiveWatchlist] = useState(null);
   const [suggestions, setSuggestions] = useState([]);
   const [newStock, setNewStock] = useState('');
   const [socket, setSocket] = useState(null);
   const { watchlists, updateWatchlists } = useWatchlistsDataStore();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [watchlistTitle, setwatchlistTitle] = useState('');

   const openModal = () => {
       setIsModalOpen(true);
   };

   const closeModal = () => {
       setIsModalOpen(false);
   };

   const handleTabClick = (tab) => {
       setActiveTab(tab);
       setActiveWatchlist(null);
   };

   const handleWatchlistClick = (watchlist) => {
       setActiveTab('watchlist');
       setActiveWatchlist(watchlist);
   };

   const handleAddWatchlist = async (watchlistTitleText) => {
    try {
        console.log("Watchlist title:", watchlistTitleText);
        if (!watchlistTitleText) {
            console.error("Error: watchlistTitleText is undefined or empty");
            return;
        }

        console.log('Sending request to:', `${process.env.NEXT_PUBLIC_WL_BE_URI}/watchlists/add`);
        console.log("Sending payload:", JSON.stringify({ title: watchlistTitleText }));

        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_WL_BE_URI}/watchlists/add`,
            { title: watchlistTitleText },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("Response received:", res.data);
    } catch (error) {
        console.error("Error in adding watchlist:", error.response ? error.response.data : error.message);
    }
};


   const handleAddStock = async () => {
       try {
           console.log('Adding stock');
           const res = await axios.post(`${process.env.NEXT_PUBLIC_WL_BE_URI}/watchlists/addStock`, {
               "watchlist": activeWatchlist.title,
               "stock": newStock
           });
           console.log(res);
       } catch (error) {
           console.log('Error in adding stock');
       }
   };

   const getWatchlists = async () => {
       try {
           console.log('Getting Watchlists');
           const res = await axios.get(`${process.env.NEXT_PUBLIC_WL_BE_URI}/watchlists/get`);
           console.log(res);
           updateWatchlists(res.data);
           //setting first watchlist as active by default
           if (res.data.length !== 0) {
               console.log('setting first watchlist as active');
               setActiveTab('watchlist');
               setActiveWatchlist(res.data[0]);
           }
       } catch (error) {
           console.log('Error in getting watchlists');
       }
   }

   const searchStocks = async (e) => {
       setNewStock(e.target.value);
       const stockToBeSearched = e.target.value;
       if (newStock.length > 2) {
           try {
               const res = await axios.get(`${process.env.NEXT_PUBLIC_AG_URI}`, { params: { q: stockToBeSearched } });
               console.log('Stocks received - ', res.data);
               const stockNames = res.data.map(stock => stock._source.name); // Extract stock names
               console.log('Stocks received - ', stockNames);
               setSuggestions(stockNames);
           } catch (error) {
               console.log("Error in searching : ", error.message)
           }
       } else {
           setSuggestions([]);
       }
   }


   useEffect(() => {
       getWatchlists();
       // const newSocket = io(`${process.env.NEXT_PUBLIC_MD_BE_URI}`);
       // setSocket(newSocket);
       // return () => newSocket.close();
   }, []);

   return (
       <div className="flex flex-col bg-gray-200 h-screen border-r border-gray-300">
           <div className="p-2">
               <div className="flex justify-between items-center mb-4">
                   <h1 className="text-lg font-semibold">Watchlists</h1>
                   <button
                       className={`text-blue-500
                                   hover:text-blue-700
                                   p-2
                                   ${isModalOpen ? 'hidden' : ''}`}
                       onClick={openModal}
                   >
                       +
                   </button>
                   {isModalOpen && (
                       <Modal onClose={closeModal}
                           onSubmit={handleAddWatchlist} />
                   )}
               </div>
               <div>
                   <ul className="flex overflow-x-auto">
                       {watchlists.map((watchlist, index) => (
                           <li
                               key={index}
                               className={`cursor-pointer mr-4 p-2 ${activeTab === 'watchlist' &&
                                   activeWatchlist === watchlist
                                   ? 'font-semibold bg-white'
                                   : ''
                                   }`}
                               onClick={() =>
                                   handleWatchlistClick(watchlist)}
                           >
                               {watchlist.title}
                           </li>
                       ))}
                   </ul>
               </div>
           </div>
           {activeTab === 'watchlist' && (
               <div className="p-4 bg-white h-full">
                   <div className="flex justify-between items-center mb-4">
                       <h1 className="text-lg font-semibold">{activeWatchlist.title}</h1>
                       <div className="flex items-center">
                           <input
                               type="text"
                               className="border border-gray-400 mr-2 p-1"
                               placeholder="New Stock"
                               value={newStock}
                               onChange={searchStocks}
                           />
                           {suggestions.length > 0 && (
                               <ul className="absolute left-0 border border-gray-400 bg-white">
                                   {suggestions.map((suggestion, index) => (
                                       <li
                                           key={index}
                                           className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                           onClick={() => {
                                               setNewStock(suggestion);
                                               setSuggestions([]);
                                           }}
                                       >
                                           {suggestion}
                                       </li>
                                   ))}
                               </ul>
                           )}
                           <button
                               className="text-blue-500 hover:text-blue-700"
                               onClick={handleAddStock}
                           >
                               +
                           </button>
                       </div>
                   </div>
                   <div>
                       <ul>
                           {watchlists
                               .find((watchlist) => watchlist === activeWatchlist)
                               ?.stocks.map((stock, index) => (
                                   <li key={index}>{stock}</li>
                               ))}
                       </ul>
                   </div>
               </div>
           )}
       </div>
   );
};

export default Sidebar;
