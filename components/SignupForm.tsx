// File: components/SignupForm.tsx

import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, View } from '../types';
import { NIGERIA_LOCATIONS } from '../constants/locations';
import { CLEANING_SERVICES } from '../constants/services';
import { apiService } from '../services/apiService';

interface SignupFormProps {
    email: string;
    onComplete: (user: User) => void;
    onNavigate: (view: View) => void;
}

type UserKind = 'Client (Individual)' | 'Client (Company)' | 'Cleaner (Individual)' | 'Cleaner (Company)' | '';

interface FeedbackMessage {
    type: 'error' | 'success';
    text: string;
}

// 🛑 GLOBAL LOCK: Exists outside the component to prevent race conditions absolutely
// This variable survives even if React re-renders the component.
let globalSubmitLock = false;

const FormSection: React.FC<{ title: string; children: React.ReactNode, description?: string }> = ({ title, description, children }) => (
    <div className="pt-8">
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">{children}</div>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const SignupForm: React.FC<SignupFormProps> = ({ email, onComplete, onNavigate }) => {
    const [userKind, setUserKind] = useState<UserKind>('');
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
        experience: '',
        bio: '',
        nin: '',
        chargeHourly: '',
        chargeDaily: '',
        chargePerContract: '',
        bankName: '',
        accountNumber: '',
    });
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [chargePerContractNegotiable, setChargePerContractNegotiable] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);
    const [businessRegFile, setBusinessRegFile] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [cities, setCities] = useState<string[]>([]);
    
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<FeedbackMessage | null>(null);
    
    // 🛡️ STICKY SUCCESS: Once true, ignore all future errors/clicks
    const [isSuccess, setIsSuccess] = useState(false);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; 
    const VALID_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

    // Reset global lock when component mounts (e.g. if user refreshes)
    useEffect(() => {
        globalSubmitLock = false;
        return () => { globalSubmitLock = false; };
    }, []);

    useEffect(() => {
        if (formData.state) {
            const selectedState = NIGERIA_LOCATIONS.find(s => s.name === formData.state);
            setCities(selectedState ? [...selectedState.towns, 'Other'] : ['Other']);
            setFormData(prev => ({ ...prev, city: '' }));
        } else {
            setCities([]);
        }
    }, [formData.state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Only clear error if we haven't succeeded yet
        if (feedbackMsg && !isSuccess) setFeedbackMsg(null);
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
        if (!isSuccess) setFeedbackMsg(null);
    };

    const sanitizeInput = (input: string): string => {
        return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const validateForm = (): string | null => {
        if (!agreedToTerms) return 'You must agree to the terms and conditions.';
        const commonFields = userKind && formData.fullName && formData.email && formData.phoneNumber && formData.state && formData.city && formData.address;
        if (!commonFields) return 'Please fill in all required personal information fields.';
        if (formData.city === 'Other' && !formData.otherCity) return 'Please specify your city/town when selecting "Other".';
        if (!governmentIdFile) return 'Government ID is required for verification.';
        
        const isCompany = userKind.includes('Company');
        if (isCompany && (!formData.companyName || !formData.companyAddress)) return 'Company name and address are required for company accounts.';

        const isCleaner = userKind.includes('Cleaner');
        if (isCleaner) {
            if (!formData.nin || formData.nin.length !== 11) return 'NIN must be 11 digits.';
            const cleanerFields = formData.experience && Number(formData.experience) > 0 && selectedServices.length > 0 && formData.bio && profilePhoto;
            if (!cleanerFields) return 'Please fill in all required cleaner information fields.';
            const hasPricing = Number(formData.chargeHourly) > 0 || Number(formData.chargeDaily) > 0 || Number(formData.chargePerContract) > 0 || chargePerContractNegotiable;
            if (!hasPricing) return 'At least one pricing option is required.';
            if (!formData.bankName || !formData.accountNumber || formData.accountNumber.length !== 10) return 'Valid bank details are required.';
            if (isCompany && !businessRegFile) return 'Business registration document is required for company cleaners.';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event bubbling

        // 🛡️ GLOBAL CHECK: If already submitting or already succeeded, STOP immediately.
        if (globalSubmitLock || isSuccess || submitting) {
            console.warn('🛑 Submission blocked: Already in progress or succeeded.');
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setFeedbackMsg({ type: 'error', text: validationError });
            return;
        }

        // 🔒 ENGAGE LOCKS
        globalSubmitLock = true;
        setSubmitting(true);
        setFeedbackMsg(null);

        const isCleaner = userKind.includes('Cleaner');
        const isCompany = userKind.includes('Company');
        const role: UserRole = isCleaner ? 'cleaner' : 'client';
        const cleanerType = isCleaner ? (isCompany ? 'Company' : 'Individual') : undefined;
        const clientType = !isCleaner ? (isCompany ? 'Company' : 'Individual') : undefined;

        const payload = new FormData();
        payload.append('fullName', sanitizeInput(formData.fullName));
        payload.append('email', formData.email);
        payload.append('password', 'defaultPassword123!');
        payload.append('phoneNumber', formData.phoneNumber);
        payload.append('gender', formData.gender);
        payload.append('state', formData.state);
        payload.append('city', formData.city);
        payload.append('address', sanitizeInput(formData.address));
        payload.append('role', role);
        
        if (formData.city === 'Other') payload.append('otherCity', sanitizeInput(formData.otherCity || ''));
        if (governmentIdFile) {
            payload.append('idDocument', governmentIdFile);
            payload.append('governmentId', governmentIdFile);
        }
        if (isCompany) {
            payload.append('companyName', sanitizeInput(formData.companyName));
            payload.append('companyAddress', sanitizeInput(formData.companyAddress));
        }
        if (role === 'client') payload.append('clientType', clientType || 'Individual');
        
        if (role === 'cleaner') {
            payload.append('cleanerType', cleanerType || 'Individual');
            payload.append('experience', formData.experience);
            payload.append('bio', sanitizeInput(formData.bio));
            payload.append('nin', formData.nin);
            if (selectedServices.length > 0) selectedServices.forEach(service => payload.append('services', service));
            if (profilePhoto) payload.append('profilePhoto', profilePhoto);
            if (businessRegFile && isCompany) payload.append('businessRegDoc', businessRegFile);
            payload.append('chargeHourly', formData.chargeHourly);
            payload.append('chargeDaily', formData.chargeDaily);
            payload.append('chargePerContract', formData.chargePerContract);
            payload.append('chargePerContractNegotiable', String(chargePerContractNegotiable));
            payload.append('bankName', sanitizeInput(formData.bankName));
            payload.append('accountNumber', formData.accountNumber);
        }

        try {
            console.log('🚀 Sending registration request via apiService...');
            // Use the robust apiService
            const data = await apiService.register(payload);
            console.log('✅ Registration successful:', data);

            // 🎉 ACTIVATE STICKY SUCCESS
            // This prevents any subsequent errors from overwriting the message
            setIsSuccess(true);
            setFeedbackMsg({ type: 'success', text: 'Account created! Redirecting...' });

            const returnedUser: User = data.user || {
                id: String(Date.now()),
                role,
                email: formData.email,
                fullName: formData.fullName,
            };
            
            if (onComplete) {
                // Delay slightly longer to ensure UI is stable and message is read
                setTimeout(() => {
                    onComplete(returnedUser);
                    // Note: We do NOT unlock globalSubmitLock here. We want it locked until the page changes.
                }, 2000);
            }

        } catch (err: any) {
            console.error('❌ SIGNUP ERROR:', err);
            
            // Only show error if we haven't already succeeded
            if (!isSuccess) {
                setFeedbackMsg({ 
                    type: 'error', 
                    text: err.message || 'Registration failed. Please try again.'
                });
                // Unlock ONLY on failure so they can try again
                globalSubmitLock = false;
                setSubmitting(false);
            }
        }
    };

    const isFormValid = () => !validateForm();

    // Add NIN field to the cleaner section
    const renderCleanerFields = () => (
        <>
            <FormSection title="Professional Profile" description="This information will be displayed publicly on your profile.">
                <div className="sm:col-span-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea name="bio" id="bio" value={formData.bio} onChange={handleInputChange} required rows={3} maxLength={300} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" placeholder="Tell clients a bit about yourself and your experience."></textarea>
                    <p className="mt-2 text-sm text-gray-500">Max 300 characters.</p>
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <input type="number" name="experience" id="experience" value={formData.experience} onChange={handleInputChange} required min="0" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" placeholder="e.g., 5"/>
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor="nin" className="block text-sm font-medium text-gray-700">National Identification Number (NIN)</label>
                    <input type="text" name="nin" id="nin" value={formData.nin} onChange={handleInputChange} required pattern="[0-9]{11}" title="Please enter your 11-digit National Identification Number." minLength={11} maxLength={11} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400" placeholder="11-digit NIN"/>
                </div>
            </FormSection>
            
            <FormSection title="Pricing">
                <div className="sm:col-span-2">
                    <label htmlFor="chargeHourly" className="block text-sm font-medium text-gray-700">Charge per Hour (₦)</label>
                    <input type="number" name="chargeHourly" id="chargeHourly" value={formData.chargeHourly} onChange={handleInputChange} min="0" placeholder="e.g., 3000" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="chargeDaily" className="block text-sm font-medium text-gray-700">Charge per Day (₦)</label>
                    <input type="number" name="chargeDaily" id="chargeDaily" value={formData.chargeDaily} onChange={handleInputChange} min="0" placeholder="e.g., 20000" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
                </div>
                 <div className="sm:col-span-2">
                    <label htmlFor="chargePerContract" className="block text-sm font-medium text-gray-700">Charge per Contract</label>
                    <input 
                        type="number" 
                        name="chargePerContract" 
                        id="chargePerContract" 
                        placeholder="e.g., 150000"
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
                                    setFormData(prev => ({ ...prev, chargePerContract: '' }));
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
    );

    // Simplified verification section without selfie
    const renderVerificationSection = () => (
        <FormSection title="Verification & Document Uploads" description="These documents are required for account verification. They will not be shared publicly.">
            {/* Government ID Only - No Selfie */}
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

            {userKind.includes('Cleaner') && (
                <>
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
                                onChange={(e) => handleFileChange(e, 'photo')}
                                required
                                accept="image/*"
                                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            />
                        </div>
                        {profilePhoto && <p className="text-sm text-green-600 mt-1">✓ Selected: {profilePhoto.name}</p>}
                    </div>
                    {userKind === 'Cleaner (Company)' && (
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
                </>
            )}
        </FormSection>
    );
    
    return (
        <div className="bg-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button 
                    onClick={() => onNavigate('auth')} 
                    className="text-sm font-medium text-primary hover:text-secondary mb-4"
                >
                    &larr; Back
                </button>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-dark mb-2">Create Your {userKind ? `${userKind} ` : ''}Account</h2>
                    <p className="text-gray-600 mb-6">Let's get you set up. Fill out the form below to get started.</p>

                    {feedbackMsg && (
                        <div className={`mb-6 p-4 rounded-md ${feedbackMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {feedbackMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        {/* Form contents managed above */}
                        <FormSection title="Account Type & Personal Information" description="Start by telling us who you are.">
                           <div className="sm:col-span-6">
                                <label htmlFor="userKind" className="block text-sm font-medium text-gray-700">Type of User *</label>
                                <select id="userKind" name="userKind" value={userKind} onChange={(e) => setUserKind(e.target.value as UserKind)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-dark text-light">
                                    <option value="" disabled>Select your user type...</option>
                                    <option value="Client (Individual)">Client (Individual)</option>
                                    <option value="Client (Company)">Client (Company)</option>
                                    <option value="Cleaner (Individual)">Cleaner (Individual)</option>
                                    <option value="Cleaner (Company)">Cleaner (Company)</option>
                                </select>
                            </div>
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
                                <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required pattern="[0-9]{10,11}" title="Please enter a valid 10 or 11-digit phone number." minLength={10} maxLength={11} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-dark text-light placeholder-gray-400"/>
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

                        {userKind.includes('Company') && (
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
                       
                        {userKind.includes('Cleaner') && renderCleanerFields()}

                        {renderVerificationSection()}
                        
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
                                <button 
                                    type="submit" 
                                    disabled={!isFormValid() || submitting || globalSubmitLock} 
                                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <><LoadingSpinner /> Creating...</> : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};