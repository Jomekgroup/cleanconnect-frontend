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

// -----------------------------------------------------------------------------
// Reusable Form Section Component
// -----------------------------------------------------------------------------
const FormSection: React.FC<{ title: string; children: React.ReactNode, description?: string }> = ({ title, description, children }) => (
    <div className="pt-8">
        <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">{children}</div>
    </div>
);

// -----------------------------------------------------------------------------
// Cleaner Type Selector Component
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Client Type Selector Component
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Main Signup Form Component
// -----------------------------------------------------------------------------
export const SignupForm: React.FC<SignupFormProps> = ({ role, email, onComplete, onNavigate }) => {
    // -------------------------------------------------------------------------
    // Form State Initialization
    // -------------------------------------------------------------------------
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
    
    // -------------------------------------------------------------------------
    // Camera Refs & State
    // -------------------------------------------------------------------------
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // -------------------------------------------------------------------------
    // Effect: Update cities when state changes
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (formData.state) {
            const selectedState = NIGERIA_LOCATIONS.find(s => s.name === formData.state);
            setCities(selectedState ? [...selectedState.towns, 'Other'] : ['Other']);
            setFormData(prev => ({ ...prev, city: '' }));
        } else {
            setCities([]);
        }
    }, [formData.state]);

    // -------------------------------------------------------------------------
    // Effect: Setup Camera Stream
    // -------------------------------------------------------------------------
    useEffect(() => {
        const startCamera = async () => {
            if (videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                    streamRef.current = stream;
                    videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error("Error accessing camera: ", err);
                    alert("Could not access the camera. Please check your browser permissions.");
                    setIsCameraOpen(false);
                }
            }
        };

        if (isCameraOpen) startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [isCameraOpen]);

    // -------------------------------------------------------------------------
    // Input Change Handler
    // -------------------------------------------------------------------------
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // -------------------------------------------------------------------------
    // Service Selection Handler
    // -------------------------------------------------------------------------
    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev => 
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    // -------------------------------------------------------------------------
    // File Upload Handler
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // Camera Handlers
    // -------------------------------------------------------------------------
    const handleOpenCamera = () => setIsCameraOpen(true);
    const handleCloseCamera = () => setIsCameraOpen(false);

    const handleCaptureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                alert("Camera is not ready yet. Please wait a moment.");
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

// -----------------------------------------------------------------------------
// JSX Form Content & Submit
// -----------------------------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            alert("You must agree to the terms and conditions.");
            return;
        }

        if (role === 'cleaner' && selectedServices.length === 0) {
            alert("Please select at least one cleaning service.");
            return;
        }

        try {
            const data = new FormData();
            data.append("fullName", formData.fullName);
            data.append("email", formData.email);
            data.append("phoneNumber", formData.phoneNumber);
            data.append("gender", formData.gender);
            data.append("state", formData.state);
            data.append("city", formData.city === "Other" ? formData.otherCity : formData.city);
            data.append("address", formData.address);
            data.append("bio", formData.bio);

            if (role === 'cleaner') {
                data.append("nin", formData.nin);
                data.append("experience", formData.experience.toString());
                data.append("chargeHourly", formData.chargeHourly.toString());
                data.append("chargeDaily", formData.chargeDaily.toString());
                data.append("chargePerContract", formData.chargePerContract.toString());
                data.append("chargePerContractNegotiable", chargePerContractNegotiable.toString());
                data.append("services", JSON.stringify(selectedServices));
                data.append("bankName", formData.bankName);
                data.append("accountNumber", formData.accountNumber);
                if (governmentIdFile) data.append("governmentId", governmentIdFile);
                if (businessRegFile) data.append("businessRegFile", businessRegFile);
            }

            if (profilePhoto) data.append("profilePhoto", profilePhoto);
            if (selfie) data.append("selfie", selfie);

            // -----------------------------------------------------------------
            // Call backend API
            // -----------------------------------------------------------------
            const response = await fetch(`/api/auth/register`, {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Signup failed");

            onComplete(result.user);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "An error occurred while signing up.");
        }
    };

    // -------------------------------------------------------------------------
    // Render Form Sections
    // -------------------------------------------------------------------------
    const renderFormContent = () => {
        if (role === 'cleaner' && !cleanerType) {
            return <CleanerTypeSelector onSelect={setCleanerType} onBack={() => onNavigate('roleSelection')} />;
        }

        if (role === 'client' && !clientType) {
            return <ClientTypeSelector onSelect={setClientType} onBack={() => onNavigate('roleSelection')} />;
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <FormSection title="Personal Information">
                    <div className="sm:col-span-3">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                            required
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                            required
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            id="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        <select
                            name="state"
                            id="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                        >
                            <option value="">Select state</option>
                            {NIGERIA_LOCATIONS.map(state => <option key={state.name} value={state.name}>{state.name}</option>)}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City / Town</label>
                        <select
                            name="city"
                            id="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                        >
                            <option value="">Select city</option>
                            {cities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        {formData.city === "Other" && (
                            <input
                                type="text"
                                name="otherCity"
                                value={formData.otherCity}
                                onChange={handleInputChange}
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                placeholder="Enter city name"
                            />
                        )}
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                        />
                    </div>
                </FormSection>

                {/* Cleaner Specific Info */}
                {role === 'cleaner' && (
                    <>
                        <FormSection title="Professional Details">
                            <div className="sm:col-span-3">
                                <label htmlFor="nin" className="block text-sm font-medium text-gray-700">NIN</label>
                                <input
                                    type="text"
                                    name="nin"
                                    id="nin"
                                    value={formData.nin}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience"
                                    id="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                    min={0}
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Services Offered</label>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {CLEANING_SERVICES.map(service => (
                                        <label key={service} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedServices.includes(service)}
                                                onChange={() => handleServiceToggle(service)}
                                                className="rounded border-gray-300"
                                            />
                                            <span>{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Pricing">
                            <div className="sm:col-span-2">
                                <label htmlFor="chargeHourly" className="block text-sm font-medium text-gray-700">Hourly Charge (₦)</label>
                                <input
                                    type="number"
                                    name="chargeHourly"
                                    id="chargeHourly"
                                    value={formData.chargeHourly}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="chargeDaily" className="block text-sm font-medium text-gray-700">Daily Charge (₦)</label>
                                <input
                                    type="number"
                                    name="chargeDaily"
                                    id="chargeDaily"
                                    value={formData.chargeDaily}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="chargePerContract" className="block text-sm font-medium text-gray-700">Charge Per Contract (₦)</label>
                                <input
                                    type="number"
                                    name="chargePerContract"
                                    id="chargePerContract"
                                    value={formData.chargePerContract}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                                <label className="inline-flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        checked={chargePerContractNegotiable}
                                        onChange={() => setChargePerContractNegotiable(prev => !prev)}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Negotiable</span>
                                </label>
                            </div>
                        </FormSection>

                        <FormSection title="Bank Details">
                            <div className="sm:col-span-3">
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    id="bankName"
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    id="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Document Uploads">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Government ID</label>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'governmentId')} />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Business Registration</label>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'businessReg')} />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                                {profilePhotoPreview && <img src={profilePhotoPreview} alt="Profile Preview" className="mt-2 w-24 h-24 rounded-full" />}
                            </div>
                        </FormSection>

                        <FormSection title="Selfie Verification">
                            {selfiePreview ? (
                                <img src={selfiePreview} alt="Selfie Preview" className="mt-2 w-24 h-24 rounded-full" />
                            ) : (
                                <button type="button" onClick={handleOpenCamera} className="bg-primary text-white py-2 px-4 rounded-lg">
                                    Open Camera
                                </button>
                            )}

                            {isCameraOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                    <div className="bg-white p-4 rounded-lg">
                                        <video ref={videoRef} autoPlay className="w-80 h-60 rounded-lg" />
                                        <canvas ref={canvasRef} className="hidden" />
                                        <div className="mt-2 flex justify-between">
                                            <button type="button" onClick={handleCaptureSelfie} className="bg-green-500 text-white py-1 px-3 rounded">Capture</button>
                                            <button type="button" onClick={handleCloseCamera} className="bg-red-500 text-white py-1 px-3 rounded">Close</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FormSection>
                    </>
                )}

                {/* Terms and Submit */}
                <FormSection title="Terms & Conditions">
                    <label className="inline-flex items-center">
                        <input type="checkbox" checked={agreedToTerms} onChange={() => setAgreedToTerms(prev => !prev)} className="rounded border-gray-300" />
                        <span className="ml-2 text-sm text-gray-600">I agree to the terms and conditions</span>
                    </label>
                </FormSection>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-secondary disabled:bg-gray-400"
                    >
                        Complete Signup
                    </button>
                </div>
            </form>
        );
    };

    return <div className="max-w-4xl mx-auto px-4 py-8">{renderFormContent()}</div>;
};
