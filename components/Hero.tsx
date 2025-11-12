import React, { useState } from 'react';
import { View } from '../types';
import { BriefcaseIcon, MapPinIcon, CalendarIcon, ChevronDownIcon } from './icons';
import { CLEANING_SERVICES } from '../constants/services';

interface HeroProps {
    onSearch: (filters: { service: string, location: string }) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
    const [location, setLocation] = useState('');
    const [service, setService] = useState(CLEANING_SERVICES[0]);

    const handleSearch = () => {
        onSearch({ service, location });
    }

    return (
        <div className="relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop&ixlib-rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-48 text-center text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                    Find Trusted Cleaners Near You
                </h1>
                <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-200">
                    Connect instantly with top-rated professionals for home, office, and specialized cleaning services across Nigeria.
                </p>
                
                <div className="mt-10 max-w-4xl mx-auto bg-white p-4 rounded-xl shadow-2xl">
                    <form className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-left" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                        <div className="md:col-span-2">
                             <label htmlFor="service" className="text-xs font-semibold text-gray-500 ml-2">Service</label>
                             <div className="relative mt-1">
                                <BriefcaseIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select 
                                    id="service" 
                                    className="w-full pl-10 pr-8 p-3 bg-dark border border-gray-600 rounded-lg appearance-none text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                >
                                    {CLEANING_SERVICES.map((serviceName) => (
                                        <option key={serviceName} value={serviceName}>
                                            {serviceName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                             </div>
                        </div>
                        <div>
                             <label htmlFor="location" className="text-xs font-semibold text-gray-500 ml-2">Location</label>
                             <div className="relative mt-1">
                                <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    id="location" 
                                    placeholder="e.g., Ikeja, Lagos" 
                                    className="w-full pl-10 p-3 bg-dark border-gray-600 rounded-lg text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                             </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-white p-3.5 rounded-lg text-base font-semibold hover:bg-secondary transition-transform transform hover:scale-105 shadow-lg mt-5">
                                Search Cleaners
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};