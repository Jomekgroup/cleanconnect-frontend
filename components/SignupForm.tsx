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

interface FeedbackMessage {
    type: 'error' | 'success';
    text: string;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode, description?: string }> = ({ title, description, children }) => (
    <div className="pt-8">
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">{children}</div>
    </div>
);

const CleanerTypeSelector: React.FC<{ onSelect: (type: 'Individual' | 'Company') => void, onBack: () => void }> = ({ onSelect, onBack }) => {
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

const ClientTypeSelector: React.FC<{ onSelect: (type: 'Individual' | 'Company') => void, onBack: () => void }> = ({ onSelect, onBack }) => {
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

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const SignupForm: React.FC<SignupFormProps> = ({ role, email, onComplete, onNavigate }) => {
    const [cleanerType, setCleanerType] = useState<'Individual' | 'Company' | null>(null);
    const [clientType, setClientType] = useState<'Individual' | 'Company' | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: email,
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
    const [feedbackMsg, setFeedbackMsg] = useState<FeedbackMessage | null>(null);
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const API_BASE = (import.meta.env as any).VITE_API_URL || 'https://cleanconnect-backend-mzc4.onrender.com/api';

    // Constants for validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const VALID_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

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
                    console.error("Error accessing camera: ", err);
                    setFeedbackMsg({ type: 'error', text: "Could not access the camera. Please check your browser permissions." });
                    setIsCameraOpen(false);
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
        if (feedbackMsg) setFeedbackMsg(null);
    };

    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev => 
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    const validateFile = (file: File): boolean => {
        if (file.size > MAX_FILE_SIZE) {
            setFeedbackMsg({ type: 'error', text: 'File size must be 5MB or less.' });
            return false;
        }
        if (!VALID_FILE_TYPES.includes(file.type)) {
            setFeedbackMsg({ type: 'error', text: 'Invalid file type. Allowed: JPG, PNG, PDF.' });
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'governmentId' | 'businessReg') => {
        if (!e.target.files || !e.target.files[0]) return;
        
        const file = e.target.files[0];
        
        if (!validateFile(file)) {
            e.target.value = '';
            return;
        }

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
        
        setFeedbackMsg(null);
    };
    
    const handleOpenCamera = () => {
        setIsCameraOpen(true);
    };
    
    const handleCloseCamera = () => {
        setIsCameraOpen(false);
    };

    const handleCaptureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                setFeedbackMsg({ type: 'error', text: "Camera is not ready yet. Please wait a moment." });
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(blob => {
                if (blob) {
                    const selfieFile = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                    setSelfie(selfieFile);
                    setSelfiePreview(URL.createObjectURL(selfieFile));
                }
            }, 'image/jpeg');

            handleCloseCamera();
        }
    };

    const sanitizeInput = (input: string): string => {
        return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const validateForm = (): string | null => {
        if (!agreedToTerms) return 'You must agree to the terms and conditions.';
        
        const commonFields = formData.fullName && formData.email && formData.phoneNumber && formData.state && formData.city && formData.address;
        if (!commonFields) return 'Please fill in all required personal information fields.';
        
        if (formData.city === 'Other' && !formData.otherCity) return 'Please specify your city/town when selecting "Other".';
        if (!selfie || !governmentIdFile) return 'Live selfie and government ID are required for verification.';
        
        const isCompany = (role === 'client' && clientType === 'Company') || (role === 'cleaner' && cleanerType === 'Company');
        if (isCompany && (!formData.companyName || !formData.companyAddress)) {
            return 'Company name and address are required for company accounts.';
        }

        if (role === 'client' && !clientType) return 'Please select client type.';

        if (role === 'cleaner') {
            const cleanerFields = cleanerType && Number(formData.experience) > 0 && selectedServices.length > 0 && formData.bio && profilePhoto && formData.nin && (Number(formData.chargeHourly) > 0 || Number(formData.chargeDaily) > 0 || Number(formData.chargePerContract) > 0 || chargePerContractNegotiable);
            if (!cleanerFields) return 'Please fill in all required cleaner information fields.';
            if (cleanerType === 'Company' && !businessRegFile) return 'Business registration document is required for company cleaners.';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setFeedbackMsg({ type: 'error', text: validationError });
            return;
        }

        setSubmitting(true);
        setFeedbackMsg(null);

        const isCompany = (role === 'client' && clientType === 'Company') || (role === 'cleaner' && cleanerType === 'Company');

        const payload = new FormData();
        
        // BASIC USER INFORMATION
        payload.append('fullName', sanitizeInput(formData.fullName));
        payload.append('email', formData.email);
        payload.append('password', 'defaultPassword123!'); // REQUIRED BY BACKEND
        payload.append('phoneNumber', formData.phoneNumber);
        payload.append('gender', formData.gender);
        payload.append('state', formData.state);
        payload.append('city', formData.city);
        payload.append('address', sanitizeInput(formData.address));
        payload.append('role', role);
        
        if (formData.city === 'Other') {
            payload.append('otherCity', sanitizeInput(formData.otherCity || ''));
        }

        // FILE UPLOADS - ONLY APPEND IF FILE EXISTS AND HAS CONTENT
        if (selfie && selfie.size > 0) {
            payload.append('selfie', selfie);
            console.log('✓ Selfie appended:', selfie.name, `(${selfie.size} bytes)`);
        } else {
            console.warn('Selfie file is empty or missing');
        }

        if (governmentIdFile && governmentIdFile.size > 0) {
            payload.append('idDocument', governmentIdFile);
            console.log('✓ Government ID appended:', governmentIdFile.name, `(${governmentIdFile.size} bytes)`);
        } else {
            console.warn('Government ID file is empty or missing');
        }

        // COMPANY INFORMATION
        if (isCompany) {
            payload.append('companyName', sanitizeInput(formData.companyName));
            payload.append('companyAddress', sanitizeInput(formData.companyAddress));
        }

        // CLIENT-SPECIFIC FIELDS
        if (role === 'client') {
            payload.append('clientType', clientType || 'Individual');
        }

        // CLEANER-SPECIFIC FIELDS
        if (role === 'cleaner') {
            payload.append('cleanerType', cleanerType || 'Individual');
            payload.append('experience', String(formData.experience));
            payload.append('bio', sanitizeInput(formData.bio));
            payload.append('nin', formData.nin);
            
            // SERVICES - FIXED: Send as array, not JSON string
            if (selectedServices.length > 0) {
                selectedServices.forEach(service => {
                    payload.append('services', service);
                });
            }
            
            // FILE UPLOADS FOR CLEANER - Only append if files exist and have content
            if (profilePhoto && profilePhoto.size > 0) {
                payload.append('profilePhoto', profilePhoto);
                console.log('✓ Profile photo appended:', profilePhoto.name, `(${profilePhoto.size} bytes)`);
            } else {
                console.warn('Profile photo file is empty or missing');
            }
            
            if (businessRegFile && businessRegFile.size > 0) {
                payload.append('businessRegDoc', businessRegFile);
                console.log('✓ Business registration appended:', businessRegFile.name, `(${businessRegFile.size} bytes)`);
            } else if (cleanerType === 'Company') {
                console.warn('Business registration file is empty or missing for company cleaner');
            }
            
            // PRICING
            payload.append('chargeHourly', String(formData.chargeHourly));
            payload.append('chargeDaily', String(formData.chargeDaily));
            payload.append('chargePerContract', String(formData.chargePerContract));
            payload.append('chargePerContractNegotiable', String(chargePerContractNegotiable));
            
            // BANK DETAILS
            payload.append('bankName', sanitizeInput(formData.bankName));
            payload.append('accountNumber', formData.accountNumber);
        }

        // DEBUG: Log all FormData entries
        console.log('=== FORM DATA BEING SENT ===');
        for (let [key, value] of payload.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, value.name, `(${value.type}, ${value.size} bytes)`);
            } else {
                console.log(`${key}:`, value);
            }
        }
        console.log('=== END FORM DATA ===');

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: payload,
            });

            if (!res.ok) {
                let errText = await res.text();
                try {
                    const json = JSON.parse(errText);
                    errText = json.message || JSON.stringify(json);
                } catch (_) {
                    // keep text as is
                }
                console.error('Server error:', errText);
                setFeedbackMsg({ type: 'error', text: `Signup failed: ${errText}` });
                setSubmitting(false);
                return;
            }

            const data = await res.json();

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
            setFeedbackMsg({ type: 'error', text: 'Cannot reach server. Check internet connection or try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid = () => !validateForm();

    const renderFormContent = () => (
         <>
            <h2 className="text-2xl font-bold text-dark mb-2">Create Your {role === 'client' ? `Client (${clientType})` : `Cleaner (${cleanerType})`} Account</h2>
            <p className="text-gray-600 mb-6">Let's get you set up. Fill out the form below to get started.</p>

            {feedbackMsg && (
                <div className={`mb-6 p-4 rounded-md ${feedbackMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {feedbackMsg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                <FormSection title="Personal Information" description="This information is for the individual creating the account.">
                   <div className="sm:col-span-3">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} required maxLength={100} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} disabled className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-gray-800 text-gray-400 placeholder-gray-400"/>
                    </div>
                    <div className="sm:col-span-3">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required pattern="[0-9]{10,11}" title="Please enter a valid 10 or 11-digit phone number." minLength="10" maxLength="11" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
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
                            <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleInputChange} required maxLength={100} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
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
                                <input type="number" name="experience" id="experience" value={formData.experience} onChange={handleInputChange} required min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="nin" className="block text-sm font-medium text-gray-700">National Identification Number (NIN)</label>
                                <input type="text" name="nin" id="nin" value={formData.nin} onChange={handleInputChange} required pattern="[0-9]{11}" title="Please enter your 11-digit National Identification Number." minLength={11} maxLength={11} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                            </div>
                        </FormSection>
                        
                        <FormSection title="Pricing">
                            <div className="sm:col-span-2">
                                <label htmlFor="chargeHourly" className="block text-sm font-medium text-gray-700">Charge per Hour (₦)</label>
                                <input type="number" name="chargeHourly" id="chargeHourly" value={formData.chargeHourly} onChange={handleInputChange} min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="chargeDaily" className="block text-sm font-medium text-gray-700">Charge per Day (₦)</label>
                                <input type="number" name="chargeDaily" id="chargeDaily" value={formData.chargeDaily} onChange={handleInputChange} min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
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
                                        e.target.value = "";
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
                                <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleInputChange} required maxLength={50} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                                <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required pattern="[0-9]{10}" title="Please enter your 10-digit NUBAN account number." minLength={10} maxLength={10} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                            </div>
                        </FormSection>
                    </>
                )}

                <FormSection title="Verification & Document Uploads" description="These documents are the final step and are required for account verification. They will not be shared publicly.">
                    {/* Selfie Capture */}
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Live Selfie</label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                {selfiePreview ? (
                                    <img src={selfiePreview} alt="Selfie preview" className="h-full w-full object-cover" />
                                ) : (
                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5S14.757 2 12 2zM12 10c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 2c-3.86 0-7 1.14-7 3.21V22h14v-6.79C19 13.14 15.86 12 12 12z"/>
                                    </svg>
                                )}
                            </span>
                            <button type="button" onClick={handleOpenCamera} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Open Camera
                            </button>
                        </div>
                        {selfie && <p className="text-sm text-green-600 mt-1">✓ Selfie captured</p>}
                    </div>

                    {/* Government ID */}
                    <div className="sm:col-span-6">
                        <label htmlFor="governmentId" className="block text-sm font-medium text-gray-700">
                            Government ID (Drivers Licence, NIN or International Passport)
                        </label>
                        <input
                            type="file"
                            name="governmentId"
                            id="governmentId"
                            onChange={(e) => handleFileChange(e, 'governmentId')}
                            required
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100"
                        />
                        {governmentIdFile && <p className="text-sm text-green-600 mt-1">✓ Selected: {governmentIdFile.name}</p>}
                        <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG up to 5MB.</p>
                    </div>

                    {/* Profile Photo (Cleaner Only) */}
                    {role === 'cleaner' && (
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                            <div className="mt-1 flex items-center">
                                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                    {profilePhotoPreview ? (
                                        <img src={profilePhotoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    )}
                                </span>
                                <input
                                    type="file"
                                    name="profilePhoto"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'photo')}
                                    required
                                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                />
                            </div>
                            {profilePhoto && <p className="text-sm text-green-600 mt-1">✓ Selected: {profilePhoto.name}</p>}
                        </div>
                    )}

                    {/* Business Registration (Cleaner Company Only) */}
                    {role === 'cleaner' && cleanerType === 'Company' && (
                        <div className="sm:col-span-6">
                            <label htmlFor="businessRegDoc" className="block text-sm font-medium text-gray-700">
                                CAC Business Registration
                            </label>
                            <input
                                type="file"
                                name="businessRegDoc"
                                id="businessRegDoc"
                                onChange={(e) => handleFileChange(e, 'businessReg')}
                                required
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100"
                            />
                            {businessRegFile && <p className="text-sm text-green-600 mt-1">✓ Selected: {businessRegFile.name}</p>}
                            <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG up to 5MB.</p>
                        </div>
                    )}
                </FormSection>
                
                <div className="pt-5">
                     <div className="flex items-start">
                        <div className="flex-shrink-0">
                           <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-primary focus:ring-secondary border-gray-300 rounded"/>
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
                            {submitting ? <><LoadingSpinner /> Creating...</> : 'Create Account'}
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
                            role === 'cleaner' ? setCleanerType(null) : setClientType(null);
                        } else {
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