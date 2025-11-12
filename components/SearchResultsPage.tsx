import React, { useState, useEffect, useMemo } from 'react';
import { Cleaner, View } from '../types';
import { SparklesIcon, MapPinIcon, BriefcaseIcon, ChevronDownIcon } from './icons';
import { CleanerCard } from './CleanerCard';
import { getAiPoweredSearchResults } from '../services/geminiService';
import { CLEANING_SERVICES } from '../constants/services';

interface SearchResultsPageProps {
    allCleaners: Cleaner[];
    onSelectCleaner: (cleaner: Cleaner) => void;
    initialFilters?: { service: string, location: string } | null;
    clearInitialFilters: () => void;
    appError: string | null;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ allCleaners, onSelectCleaner, initialFilters, clearInitialFilters, appError }) => {
    const [aiQuery, setAiQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Cleaner[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState({ service: '', location: '' });

    const performSearch = async (query: string) => {
        setIsLoading(true);
        setError(null);
        setActiveFilters({ service: '', location: '' });

        try {
            const resultIds = await getAiPoweredSearchResults(query);
            const results = resultIds
                .map(id => allCleaners.find(c => c.id === id))
                .filter((c): c is Cleaner => c !== undefined);
            setSearchResults(results);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred while searching. Please try again.");
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialFilters) {
            setActiveFilters(initialFilters);
            clearInitialFilters();
            setSearchResults(null);
            setAiQuery('');
        }
    }, [initialFilters, clearInitialFilters]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (aiQuery.trim()) {
                performSearch(aiQuery);
            }
        }, 1000); // 1-second debounce

        return () => clearTimeout(handler);
    }, [aiQuery, allCleaners]);

    const displayedCleaners = useMemo(() => {
        if (appError) return [];
        if (searchResults) {
            return searchResults;
        }

        const { service, location } = activeFilters;
        if (service || location) {
            return allCleaners.filter(cleaner => {
                const serviceMatch = service ? cleaner.serviceTypes.includes(service) : true;
                const locationMatch = location 
                    ? cleaner.city.toLowerCase().includes(location.toLowerCase()) || 
                      cleaner.state.toLowerCase().includes(location.toLowerCase()) ||
                      (cleaner.otherCity && cleaner.otherCity.toLowerCase().includes(location.toLowerCase()))
                    : true;
                return serviceMatch && locationMatch;
            });
        }
        return allCleaners;
    }, [searchResults, activeFilters, allCleaners, appError]);

    const resultsTitle = useMemo(() => {
        if (searchResults) return 'AI Search Results';
        if (activeFilters.service || activeFilters.location) return 'Filtered Results';
        return 'All Available Cleaners';
    }, [searchResults, activeFilters]);

    const handleAiQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAiQuery(e.target.value);
        if (e.target.value.trim() === '') {
            setSearchResults(null);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setActiveFilters(prev => ({ ...prev, [name]: value }));
        setAiQuery('');
        setSearchResults(null);
    };

    return (
        <div className="p-4 sm:p-8 container mx-auto">
            <h1 className="text-3xl font-bold text-dark text-center mb-8">Find the Perfect Cleaner</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                    <label htmlFor="ai-search" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                        <SparklesIcon className="w-5 h-5 text-primary"/>
                        <span className="font-semibold">AI Powered Search</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="ai-search"
                            value={aiQuery}
                            onChange={handleAiQueryChange}
                            placeholder="e.g., 'Find the best-rated cleaner in Maitama for deep cleaning'"
                            className="w-full pl-4 pr-10 p-3 bg-dark border-gray-600 rounded-lg text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {isLoading && aiQuery && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-light"></div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Describe what you need, and our AI will find the best match for you.</p>
                </div>

                <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-sm text-gray-500">Or use manual filters</span>
                    </div>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 text-left mt-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="md:col-span-1">
                        <label htmlFor="service" className="text-xs font-semibold text-gray-500 ml-2">Service</label>
                        <div className="relative mt-1">
                            <BriefcaseIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select 
                                id="service" 
                                name="service"
                                className="w-full pl-10 pr-8 p-3 bg-dark border border-gray-600 rounded-lg appearance-none text-light focus:outline-none focus:ring-2 focus:ring-primary"
                                value={activeFilters.service}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Services</option>
                                {CLEANING_SERVICES.map((serviceName) => (
                                    <option key={serviceName} value={serviceName}>{serviceName}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="location" className="text-xs font-semibold text-gray-500 ml-2">Location</label>
                        <div className="relative mt-1">
                            <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                id="location" 
                                name="location"
                                placeholder="e.g., Ikeja, Lagos" 
                                className="w-full pl-10 p-3 bg-dark border-gray-600 rounded-lg text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={activeFilters.location}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                        <div className="md:col-span-1">
                        {/* Empty div for alignment */}
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h3 className="text-2xl font-bold">{resultsTitle}</h3>
                {appError && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                        <strong className="font-bold">Connection Error! </strong>
                        <span className="block sm:inline">{appError}</span>
                    </div>
                )}
                {isLoading && !appError ? (
                        <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (<div key={index} className="bg-gray-200 rounded-xl w-full h-96 animate-pulse"></div>))}
                    </div>
                ) : displayedCleaners.length > 0 && !appError ? (
                    <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {displayedCleaners.map(cleaner => (<CleanerCard key={cleaner.id} cleaner={cleaner} onClick={() => onSelectCleaner(cleaner)} />))}
                    </div>
                ) : !appError ? (
                    <p className="mt-4 text-gray-500 bg-white p-6 rounded-lg shadow-sm">No cleaners found matching your criteria.</p>
                ) : null }
            </div>
        </div>
    );
};
