import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, View } from '../types';
import { NIGERIA_LOCATIONS } from '../constants/locations';
import { CLEANING_SERVICES } from '../constants/services';

interface SignupFormProps {
    role: UserRole;
    email: string;
    onComplete: (user: User) => void;
    onNavigate: (view: View) => void;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode; description?: string }> = ({ title, description, children }) => (
    <div className="pt-8">
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">{children}</div>
    </div>
);

const CleanerTypeSelector: React.FC<{ onSelect: (type: 'Individual' | 'Company') => void; onBack: () => void }> = ({ onSelect, onBack }) => {
    const [selection, setSelection] = useState<'Individual' | 'Company' | null>(null);

    return (
        <div className="text-center">
            <h3 className="text-xl font-semibold text-dark">Are you an individual or a company?</h3>
            <p className="mt-2 text-gray-600">Please select the option that best describes you.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => setSelection('Individual')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selection === 'Individual' ? 'border-primary bg-green-50' : 'hover:border-primary/50'}`}
                >
                    <h4 className="font-bold text-primary">Cleaner (Individual)</h4>
                    <p className="text-sm text-gray-500 mt-1">A single person offering cleaning services.</p>
                </div>
                <div
                    onClick={() => setSelection('Company')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selection === 'Company' ? 'border-primary bg-green-50' : 'hover:border-primary/50'}`}
                >
                    <h4 className="font-bold text-primary">Cleaner (Company)</h4>
                    <p className="text-sm text-gray-500 mt-1">A registered business or cleaning company.</p>
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={onBack} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Back
                </button>
                <button
                    onClick={() => selection && onSelect(selection)}
                    disabled={!selection}
                    className="bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-secondary disabled:bg-gray-400"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

const ClientTypeSelector: React.FC<{ onSelect: (type: 'Individual' | 'Company') => void; onBack: () => void }> = ({ onSelect, onBack }) => {
    const [selection, setSelection] = useState<'Individual' | 'Company' | null>(null);

    return (
        <div className="text-center">
            <h3 className="text-xl font-semibold text-dark">Are you an individual or a company?</h3>
            <p className="mt-2 text-gray-600">Please select the option that best describes you.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => setSelection('Individual')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selection === 'Individual' ? 'border-primary bg-green-50' : 'hover:border-primary/50'}`}
                >
                    <h4 className="font-bold text-primary">Client (Individual)</h4>
                    <p className="text-sm text-gray-500 mt-1">Booking cleaning services for personal or residential needs.</p>
                </div>
                <div
                    onClick={() => setSelection('Company')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selection === 'Company' ? 'border-primary bg-green-50' : 'hover:border-primary/50'}`}
                >
                    <h4 className="font-bold text-primary">Client (Company)</h4>
                    <p className="text-sm text-gray-500 mt-1">Booking cleaning services for a business or organization.</p>
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={onBack} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Back
                </button>
                <button
                    onClick={() => selection && onSelect(selection)}
                    disabled={!selection}
                    className="bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-secondary disabled:bg-gray-400"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export const SignupForm: React.FC<SignupFormProps> = ({ role, email, onComplete, onNavigate }) => {
    const [cleanerType, setCleanerType] = useState<'Individual' | 'Company' | null>(null);
    const [clientType, setClientType] = useState<'Individual' | 'Company' | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: email, // Pre-fill email from props
        phoneNumber: '',
        gender: 'Male',
        state: '',
        city: '',
        otherCity: '',
        address: '',
        companyName: '',
        companyAddress: '',
        experience: 0,
        bio: '',
        nin: '',
        chargeHourly: 0,
        chargeDaily: 0,
        chargePerContract: 0,
        bankName: '',
        accountNumber: '',
    });
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [chargePerContractNegotiable, setChargePerContractNegotiable] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);
    const [businessRegFile, setBusinessRegFile] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [cities, setCities] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // API base - use VITE_API_URL if provided in Vercel env, otherwise fallback to Render URL
    const API_BASE = (import.meta.env as any).VITE_API_URL || 'https://cleanconnect-backend-mzc4.onrender.com/api';

    useEffect(() => {
        if (formData.state) {
            const selectedState = NIGERIA_LOCATIONS.find(s => s.name === formData.state);
            setCities(selectedState ? [...selectedState.towns, 'Other'] : ['Other']);
            setFormData(prev => ({ ...prev, city: '' }));
        } else {
            setCities([]);
        }
    }, [formData.state]);

    // Effect to handle camera stream setup and cleanup
    useEffect(() => {
        const startCamera = async () => {
            if (videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                    streamRef.current = stream;
                    videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error('Error accessing camera: ', err);
                    alert('Could not access the camera. Please check your browser permissions.');
                    setIsCameraOpen(false); // Close modal on error
                }
            }
        };

        if (isCameraOpen) {
            startCamera();
        }

        // Cleanup function to stop stream when modal is closed or component unmounts
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [isCameraOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev => (prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'governmentId' | 'businessReg') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            switch (fileType) {
                case 'photo':
                    setProfilePhoto(file);
                    setProfilePhotoPreview(URL.createObjectURL(file));
                    break;
                case 'governmentId':
                    setGovernmentIdFile(file);
                    break;
                case 'businessReg':
                    setBusinessRegFile(file);
                    break;
            }
        }
    };

    const handleOpenCamera = () => {
        setIsCameraOpen(true);
    };

    const handleCloseCamera = () => {
        setIsCameraOpen(false); // Triggers useEffect cleanup
    };

    const handleCaptureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Prevent capturing a blank image if the video stream isn't ready.
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                alert('Camera is not ready yet. Please wait a moment.');
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                if (blob) {
                    const selfieFile = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                    setSelfie(selfieFile);
                    setSelfiePreview(URL.createObjectURL(selfieFile));
                }
            }, 'image/jpeg');

            handleCloseCamera();
        }
    };

    // Validation helper (keeps original validation logic intact)
    const isFormValid = () => {
        const commonFields = formData.fullName && formData.email && formData.phoneNumber && formData.state && formData.city && formData.address;
        if (!commonFields || !agreedToTerms) return false;

        if (formData.city === 'Other' && !formData.otherCity) return false;

        if (!selfie || !governmentIdFile) return false;

        const isCompany = (role === 'client' && clientType === 'Company') || (role === 'cleaner' && cleanerType === 'Company');
        if (isCompany && (!formData.companyName || !formData.companyAddress)) {
            return false;
        }

        if (role === 'client') {
            if (!clientType) return false;
        }

        if (role === 'cleaner') {
            const cleanerFields = cleanerType && Number(formData.experience) > 0 && selectedServices.length > 0 && formData.bio && profilePhoto && formData.nin && (Number(formData.chargeHourly) > 0 || Number(formData.chargeDaily) > 0 || Number(formData.chargePerContract) > 0 || chargePerContractNegotiable);
            if (!cleanerFields) return false;
            if (cleanerType === 'Company' && !businessRegFile) return false;
        }
        return true;
    };

    // --- NEW: Submit to backend (sends FormData including files) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            alert('You must agree to the terms and conditions.');
            return;
        }

        setSubmitting(true);

        const isCompany = (role === 'client' && clientType === 'Company') || (role === 'cleaner' && cleanerType === 'Company');

        const payload = new FormData();
        payload.append('role', role);
        payload.append('fullName', formData.fullName);
        payload.append('email', formData.email);
        payload.append('phoneNumber', formData.phoneNumber);
        payload.append('gender', formData.gender);
        payload.append('state', formData.state);
        payload.append('city', formData.city);
        payload.append('address', formData.address);
        if (formData.city === 'Other') payload.append('otherCity', formData.otherCity || '');

        if (selfie) payload.append('selfie', selfie);
        if (governmentIdFile) payload.append('governmentId', governmentIdFile);

        if (isCompany) {
            payload.append('companyName', formData.companyName);
            payload.append('companyAddress', formData.companyAddress);
        }

        if (role === 'cleaner') {
            payload.append('cleanerType', cleanerType || 'Individual');
            payload.append('experience', String(formData.experience));
            payload.append('bio', formData.bio);
            payload.append('nin', formData.nin);
            payload.append('services', JSON.stringify(selectedServices || []));
            if (profilePhoto) payload.append('profilePhoto', profilePhoto);
            if (businessRegFile) payload.append('businessRegDoc', businessRegFile);
            payload.append('chargeHourly', String(formData.chargeHourly));
            payload.append('chargeDaily', String(formData.chargeDaily));
            payload.append('chargePerContract', String(formData.chargePerContract));
            payload.append('chargePerContractNegotiable', String(chargePerContractNegotiable));
            payload.append('bankName', formData.bankName);
            payload.append('accountNumber', formData.accountNumber);
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: payload,
                // Note: do NOT set Content-Type header when sending FormData — browser sets multipart boundary for you
                // credentials: 'include' // uncomment if your backend expects cookies
            });

            if (!res.ok) {
                let errText = await res.text();
                try {
                    const json = JSON.parse(errText);
                    errText = json.message || JSON.stringify(json);
                } catch (_) {
                    // keep text
                }
                alert('Signup failed: ' + errText);
                setSubmitting(false);
                return;
            }

            const data = await res.json();

            // If backend returns user object, use it. Otherwise, build fallback user and return to parent.
            const returnedUser: User = data.user || {
                id: String(Date.now()),
                role,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                fullName: formData.fullName,
                gender: formData.gender as 'Male' | 'Female' | 'Other',
                state: formData.state,
                city: formData.city,
                otherCity: formData.city === 'Other' ? formData.otherCity : undefined,
                address: formData.address,
                selfie: selfie || undefined,
                governmentId: governmentIdFile || undefined,
            } as User;

            onComplete(returnedUser);
        } catch (err) {
            console.error('Signup error', err);
            alert('Cannot reach the server. Please check your internet or try again shortly.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderFormContent = () => (
        <>
            <h2 className="text-2xl font-bold text-dark mb-2">Create Your {role === 'client' ? `Client (${clientType})` : `Cleaner (${cleanerType})`} Account</h2>
            <p className="text-gray-600 mb-6">Let's get you set up. Fill out the form below to get started.</p>

            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                <FormSection title="Personal Information" description="This information is for the individual creating the account.">
                    <div className="sm:col-span-3">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} required maxLength={100} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} disabled className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-gray-800 text-gray-400 placeholder-gray-400" />
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required pattern="[0-9]{10,11}" title="Please enter a valid 10 or 11-digit phone number." minLength="10" maxLength="11" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-dark text-light">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        <select id="state" name="state" value={formData.state} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-dark text-light">
                            <option value="">Select State</option>
                            {NIGERIA_LOCATIONS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City/Town</label>
                        <select id="city" name="city" value={formData.city} onChange={handleInputChange} required disabled={cities.length === 0} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-dark text-light disabled:bg-gray-800 disabled:text-gray-400">
                            <option value="">Select City</option>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    {formData.city === 'Other' && (
                        <div className="sm:col-span-3">
                            <label htmlFor="otherCity" className="block text-sm font-medium text-gray-700">Please specify your City/Town</label>
                            <input
                                type="text"
                                name="otherCity"
                                id="otherCity"
                                value={formData.otherCity}
                                onChange={handleInputChange}
                                required
                                maxLength={50}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"
                            />
                        </div>
                    )}
                    <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Personal/Residential Address</label>
                        <textarea name="address" id="address" value={formData.address} onChange={handleInputChange} required rows={3} maxLength={250} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"></textarea>
                    </div>
                </FormSection>

                {((role === 'client' && clientType === 'Company') || (role === 'cleaner' && cleanerType === 'Company')) && (
                    <FormSection title="Company Information" description="Please provide the details of your company.">
                        <div className="sm:col-span-6">
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleInputChange} required maxLength={100} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                        </div>
                        <div className="sm:col-span-6">
                            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Company Address</label>
                            <textarea name="companyAddress" id="companyAddress" value={formData.companyAddress} onChange={handleInputChange} required rows={3} maxLength={250} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"></textarea>
                        </div>
                    </FormSection>
                )}

                {role === 'cleaner' && (
                    <>
                        <FormSection title="Professional Profile" description="This information will be displayed publicly on your profile.">
                            <div className="sm:col-span-6">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea name="bio" id="bio" value={formData.bio} onChange={handleInputChange} required rows={3} maxLength={300} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" placeholder="Tell clients a bit about yourself and your experience."></textarea>
                                <p className="mt-2 text-sm text-gray-500">Max 300 characters.</p>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                <input type="number" name="experience" id="experience" value={formData.experience} onChange={handleInputChange} required min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="nin" className="block text-sm font-medium text-gray-700">National Identification Number (NIN)</label>
                                <input type="text" name="nin" id="nin" value={formData.nin} onChange={handleInputChange} required pattern="[0-9]{11}" title="Please enter your 11-digit National Identification Number." minLength={11} maxLength={11} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                            </div>
                        </FormSection>

                        <FormSection title="Pricing">
                            <div className="sm:col-span-2">
                                <label htmlFor="chargeHourly" className="block text-sm font-medium text-gray-700">Charge per Hour (₦)</label>
                                <input type="number" name="chargeHourly" id="chargeHourly" value={formData.chargeHourly} onChange={handleInputChange} min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="chargeDaily" className="block text-sm font-medium text-gray-700">Charge per Day (₦)</label>
                                <input type="number" name="chargeDaily" id="chargeDaily" value={formData.chargeDaily} onChange={handleInputChange} min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="chargePerContract" className="block text-sm font-medium text-gray-700">Charge per Contract</label>
                                <input
                                    type="number"
                                    name="chargePerContract"
                                    id="chargePerContract"
                                    placeholder="₦"
                                    value={formData.chargePerContract}
                                    onChange={handleInputChange}
                                    disabled={chargePerContractNegotiable}
                                    min="0"
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400 disabled:bg-gray-800"
                                />
                                <div className="mt-2 flex items-center">
                                    <input
                                        id="negotiable"
                                        name="negotiable"
                                        type="checkbox"
                                        checked={chargePerContractNegotiable}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setChargePerContractNegotiable(isChecked);
                                            if (isChecked) {
                                                setFormData(prev => ({ ...prev, chargePerContract: 0 }));
                                            }
                                        }}
                                        className="h-4 w-4 text-primary focus:ring-secondary border-gray-300 rounded"
                                    />
                                    <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-700">Negotiable</label>
                                </div>
                            </div>
                        </FormSection>

                        <div className="pt-8">
                            <h3 className="text-lg font-medium text-gray-900">Services Offered</h3>
                            <p className="mt-1 text-sm text-gray-500">Select all services you provide.</p>
                            <div className="mt-4 sm:col-span-6">
                                <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 sr-only">Add a service</label>
                                <select
                                    id="service-select"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-dark text-light"
                                    onChange={(e) => {
                                        const service = e.target.value;
                                        if (service && !selectedServices.includes(service)) {
                                            setSelectedServices([...selectedServices, service]);
                                        }
                                        e.target.value = ''; // Reset dropdown
                                    }}
                                >
                                    <option value="">-- Choose a service to add --</option>
                                    {CLEANING_SERVICES.filter(s => !selectedServices.includes(s)).map(service => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {selectedServices.map(service => (
                                    <div key={service} className="flex items-center bg-green-100 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                                        <span>{service}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleServiceToggle(service)}
                                            className="ml-2 -mr-1 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary hover:bg-green-200 focus:outline-none focus:bg-green-500"
                                        >
                                            <span className="sr-only">Remove {service}</span>
                                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <FormSection title="Bank Details" description="For receiving payments from clients.">
                            <div className="sm:col-span-3">
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleInputChange} required maxLength={50} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                                <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required pattern="[0-9]{10}" title="Please enter your 10-digit NUBAN account number." minLength={10} maxLength={10} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" />
                            </div>
                        </FormSection>
                    </>
                )}

                <FormSection title="Verification & Document Uploads" description="These documents are the final step and are required for account verification. They will not be shared publicly.">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Live Selfie</label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                {selfiePreview ? <img src={selfiePreview} alt="Selfie preview" className="h-full w-full object-cover" /> : <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5S14.757 2 12 2zM12 10c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 2c-3.86 0-7 1.14-7 3.21V22h14v-6.79C19 13.14 15.86 12 12 12z"/></svg>}
                            </span>
                            <button type="button" onClick={handleOpenCamera} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Open Camera
                            </button>
                        </div>
                    </div>
                    <div className="sm:col-span-6">
                        <label htmlFor="governmentId" className="block text-sm font-medium text-gray-700">
                            Government ID (Drivers Licence, NIN or International Passport)
                        </label>
                        <input type="file" name="governmentId" id="governmentId" onChange={(e) => handleFileChange(e, 'governmentId')} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100" />
                        <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG up to 5MB.</p>
                    </div>

                    {role === 'cleaner' && (
                        <>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                                <div className="mt-1 flex items-center">
                                    <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                        {profilePhotoPreview ? <img src={profilePhotoPreview} alt="Profile preview" className="h-full w-full object-cover" /> : <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                    </span>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'photo')} required accept="image/*" className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" />
                                </div>
                            </div>
                            {cleanerType === 'Company' && (
                                <div className="sm:col-span-6">
                                    <label htmlFor="businessRegDoc" className="block text-sm font-medium text-gray-700">
                                        CAC Business Registration
                                    </label>
                                    <input type="file" name="businessRegDoc" id="businessRegDoc" onChange={(e) => handleFileChange(e, 'businessReg')} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100" />
                                    <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG up to 5MB.</p>
                                </div>
                            )}
                        </>
                    )}
                </FormSection>

                <div className="pt-5">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-primary focus:ring-secondary border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="font-medium text-gray-700">I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a></label>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button type="button" onClick={() => onNavigate('landing')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" disabled={!isFormValid() || submitting} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {submitting ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );

    return (
        <div className="bg-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => {
                        if ((role === 'cleaner' && cleanerType) || (role === 'client' && clientType)) {
                            // If in form, go back to type selector
                            role === 'cleaner' ? setCleanerType(null) : setClientType(null);
                        } else {
                            // If in type selector, go back to role selection screen
                            onNavigate('roleSelection');
                        }
                    }}
                    className="text-sm font-medium text-primary hover:text-secondary mb-4"
                >
                    &larr; Back
                </button>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    {role === 'cleaner' && !cleanerType ? (
                        <CleanerTypeSelector onSelect={setCleanerType} onBack={() => onNavigate('roleSelection')} />
                    ) : role === 'client' && !clientType ? (
                        <ClientTypeSelector onSelect={setClientType} onBack={() => onNavigate('roleSelection')} />
                    ) : (
                        renderFormContent()
                    )}
                </div>
            </div>

            {isCameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-xl text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Live Selfie Capture</h3>
                        <p className="text-sm text-gray-500 mb-4">Position your face in the center and hold still.</p>
                        <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-md h-auto"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="mt-4 flex justify-center gap-4">
                            <button onClick={handleCloseCamera} className="bg-gray-200 py-2 px-4 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-300">Cancel</button>
                            <button onClick={handleCaptureSelfie} className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-secondary">Capture</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
