import React, { useState, useEffect, useRef } from 'react';
import { User, View, Receipt } from '../types';
import { PencilIcon, StarIcon } from './icons';
import { CLEANING_SERVICES } from '../constants/services';
import { CLIENT_LIMITS } from '../constants/subscriptions';

interface DashboardProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onNavigate: (view: View) => void;
    onUploadSubscriptionReceipt: (receipt: Receipt) => void;
}

const ProfileField: React.FC<{ label: string; value?: string | number | null | string[]; isEditing?: boolean; children?: React.ReactNode }> = ({ label, value, isEditing, children }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
            {isEditing ? children : (
                <div className="flex-grow">
                    {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-2">
                            {value.length > 0 ? value.map(item => (
                                <span key={item} className="bg-green-100 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{item}</span>
                            )) : 'N/A'}
                        </div>
                    ) : (value || 'N/A')}
                </div>
            )}
        </dd>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, onNavigate, onUploadSubscriptionReceipt }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    
    // ✅ CRITICAL FIX: Initialize preview with existing photoUrl
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(user.photoUrl || null);
    
    const subReceiptInputRef = useRef<HTMLInputElement>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    const limit = user.subscriptionTier ? CLIENT_LIMITS[user.subscriptionTier] : 0;
    const currentClientsCount = user.monthlyNewClientsIds?.length || 0;
    const isLimitReached = user.subscriptionTier ? currentClientsCount >= limit : false;


    useEffect(() => {
        setFormData(user);
        // Update preview if user data changes (e.g. after upload)
        if (user.photoUrl) {
             setProfilePhotoPreview(user.photoUrl);
        }
        
        if (user.subscriptionEndDate) {
            const today = new Date();
            const endDate = new Date(user.subscriptionEndDate);
            today.setHours(0, 0, 0, 0); 
            const timeDiff = endDate.getTime() - today.getTime();
            const remaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
            setDaysRemaining(remaining);
        } else {
            setDaysRemaining(null);
        }
    }, [user]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({...prev, profilePhoto: file }));
            setProfilePhotoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSave = () => {
        onUpdateUser(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    };
    
    const handleReceiptUploadClick = () => {
        subReceiptInputRef.current?.click();
    };

    const handleSubReceiptFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    onUploadSubscriptionReceipt({ name: file.name, dataUrl: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
        if(event.target) {
            event.target.value = '';
        }
    };
    
    const renderValueOrInput = (name: keyof User, type: 'text' | 'email' | 'tel' | 'number' = 'text', options: Record<string, any> = {}) => {
        return (
            <input
                type={type}
                name={name}
                id={name}
                value={formData[name] as string || ''}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                {...options}
            />
        );
    };
    
    const locationString = formData.city === 'Other' && formData.otherCity ? `${formData.otherCity}, ${formData.state}` : `${formData.city}, ${formData.state}`;
    
    const reviews = user.reviewsData || [];
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    const avgTimeliness = reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.timeliness || 0), 0) / reviews.length : 0;
    const avgThoroughness = reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.thoroughness || 0), 0) / reviews.length : 0;
    const avgConduct = reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.conduct || 0), 0) / reviews.length : 0;


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <input
                type="file"
                ref={subReceiptInputRef}
                onChange={handleSubReceiptFileSelected}
                className="hidden"
                accept="image/*,.pdf"
            />
             {isLimitReached && (
                <div className="p-4 rounded-md mb-6 bg-red-100 border-red-200 text-red-800">
                    <h4 className="font-bold">Monthly Client Limit Reached!</h4>
                    <p className="text-sm">
                        You have reached your limit of <strong>{limit}</strong> new client{limit !== 1 ? 's' : ''} for this month on the <strong>{user.subscriptionTier}</strong> plan.
                    </p>
                    <div className="mt-2">
                        <p className="text-sm mb-2">To accept jobs from new clients, please upgrade your plan.</p>
                        <button onClick={() => onNavigate('subscription')} className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-red-700">
                            Upgrade Subscription
                        </button>
                    </div>
                </div>
            )}
            {daysRemaining !== null && daysRemaining <= 7 && user.subscriptionTier !== 'Free' && (
                 <div className={`p-4 rounded-md mb-6 border ${daysRemaining <= 0 ? 'bg-red-100 border-red-200 text-red-800' : 'bg-yellow-100 border-yellow-200 text-yellow-800'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">
                                {daysRemaining <= 0 ? 'Subscription Expired' : 'Subscription Expiring Soon'}
                            </h4>
                            <p className="text-sm">
                                {daysRemaining <= 0
                                    ? 'Your account has been reverted to the Free plan. Renew now to restore your premium features.'
                                    : `Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to avoid service interruption.`}
                            </p>
                        </div>
                        <button 
                            onClick={() => onNavigate('subscription')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md shadow-sm ${daysRemaining <= 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                        >
                            Renew Subscription
                        </button>
                    </div>
                </div>
            )}
            {user.pendingSubscription && (
                <div className={`p-4 rounded-md mb-6 ${user.subscriptionReceipt ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    <h4 className="font-bold">Subscription Upgrade Pending</h4>
                    <p className="text-sm">
                        Your request to upgrade to the <strong>{user.pendingSubscription}</strong> plan is being processed.
                    </p>
                    {!user.subscriptionReceipt ? (
                        <div className="mt-2">
                             <p className="text-sm mb-2">Please upload your payment receipt to continue.</p>
                             <button onClick={handleReceiptUploadClick} className="bg-yellow-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-yellow-600">
                                Upload Receipt
                             </button>
                        </div>
                    ) : (
                         <p className="text-sm mt-2">Your receipt has been submitted. Your plan will be upgraded upon admin confirmation.</p>
                    )}
                </div>
            )}

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        My Profile & Jobs
                    </button>
                    <button onClick={() => setActiveTab('reviews')} className={`${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        My Reviews & Ratings
                    </button>
                </nav>
            </div>
            
            {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 sm:flex sm:items-center sm:justify-between bg-gray-50 border-b">
                        <div className="sm:flex sm:items-center sm:space-x-5">
                             <div className="relative">
                                {/* ✅ DASHBOARD IMAGE FIX */}
                                <img className="h-20 w-20 rounded-full object-cover" src={profilePhotoPreview || 'https://avatar.iran.liara.run/public'} alt="Profile" />
                                {isEditing && (
                                    <div className="absolute bottom-0 right-0">
                                        <label htmlFor="profilePhoto-upload" className="cursor-pointer bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
                                            <PencilIcon className="w-4 h-4 text-primary"/>
                                        </label>
                                        <input id="profilePhoto-upload" name="profilePhoto-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-center sm:mt-0 sm:text-left">
                                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{formData.fullName}</p>
                                <p className="text-sm font-medium text-gray-600">{formData.email}</p>
                            </div>
                        </div>
                         <div className="mt-5 flex justify-center sm:mt-0">
                            {isEditing ? (
                                <div className="flex gap-3">
                                    <button onClick={handleCancel} type="button" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
                                    <button onClick={handleSave} type="button" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Save Changes</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditing(true)} type="button" className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    <PencilIcon className="w-4 h-4 text-gray-600"/>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                             <div className="px-4 sm:px-6">
                                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                                    <dt className="text-sm font-medium text-gray-500">Subscription</dt>
                                    <dd className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                        <div>
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                formData.subscriptionTier === 'Premium' ? 'bg-purple-100 text-purple-800' :
                                                formData.subscriptionTier === 'Pro' ? 'bg-indigo-100 text-indigo-800' :
                                                formData.subscriptionTier === 'Standard' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {formData.subscriptionTier} Plan
                                            </span>
                                            {formData.subscriptionEndDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Expires on: {new Date(formData.subscriptionEndDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                        <button onClick={() => onNavigate('subscription')} className="font-medium text-primary hover:text-secondary mt-2 sm:mt-0">
                                            Manage Subscription
                                        </button>
                                    </dd>
                                </div>
                            </div>
                            <div className="px-4 sm:px-6">
                                <h3 className="text-lg font-medium text-gray-900 mt-4">Personal Information</h3>
                            </div>
                             <div className="px-4 sm:px-6">
                                <ProfileField label="Full Name" value={formData.fullName} isEditing={isEditing}>{renderValueOrInput('fullName', 'text', { maxLength: 100 })}</ProfileField>
                                <ProfileField label="Phone Number" value={formData.phoneNumber} isEditing={isEditing}>{renderValueOrInput('phoneNumber', 'tel', { pattern: "[0-9]{10,11}", title: "Please enter a valid 10 or 11-digit phone number.", minLength: 10, maxLength: 11 })}</ProfileField>
                                <ProfileField label="Address" value={formData.address} isEditing={isEditing}>{isEditing ? <textarea name="address" value={formData.address} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" rows={3} maxLength={250} /> : formData.address}</ProfileField>
                                <ProfileField label="City" value={locationString}/>
                                <ProfileField label="Gender" value={formData.gender} isEditing={isEditing}>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </ProfileField>
                            </div>
                           
                            {formData.cleanerType === 'Company' && (
                                 <div className="px-4 sm:px-6">
                                    <h3 className="text-lg font-medium text-gray-900 mt-6">Company Information</h3>
                                    <ProfileField label="Company Name" value={formData.companyName} isEditing={isEditing}>{renderValueOrInput('companyName', 'text', { maxLength: 100 })}</ProfileField>
                                    <ProfileField label="Company Address" value={formData.companyAddress} isEditing={isEditing}>{isEditing ? <textarea name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" rows={3} maxLength={250} /> : formData.companyAddress}</ProfileField>
                                </div>
                            )}

                             <div className="px-4 sm:px-6">
                                <h3 className="text-lg font-medium text-gray-900 mt-6">Professional Details</h3>
                                <ProfileField label="Bio" value={formData.bio} isEditing={isEditing}>{isEditing ? <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" rows={4} maxLength={300}/> : formData.bio}</ProfileField>
                                <ProfileField label="Years of Experience" value={formData.experience} isEditing={isEditing}>{renderValueOrInput('experience', 'number', { min: 0 })}</ProfileField>
                                <ProfileField label="NIN" value={formData.nin} isEditing={isEditing}>{renderValueOrInput('nin', 'text', { pattern: "[0-9]{11}", title: "Please enter your 11-digit NIN.", minLength: 11, maxLength: 11 })}</ProfileField>
                                <ProfileField label="Services Offered" value={formData.services} isEditing={isEditing}>
                                    <div className="w-full">
                                        <select
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm mb-2"
                                            onChange={(e) => {
                                                const service = e.target.value;
                                                if (service && !formData.services?.includes(service)) {
                                                    setFormData(prev => ({...prev, services: [...(prev.services || []), service]}));
                                                }
                                                e.target.value = "";
                                            }}
                                        >
                                             <option value="">-- Add a service --</option>
                                             {CLEANING_SERVICES.filter(s => !formData.services?.includes(s)).map(service => (
                                                <option key={service} value={service}>{service}</option>
                                            ))}
                                        </select>
                                         <div className="flex flex-wrap gap-2">
                                            {formData.services?.map(s => (
                                                <span key={s} className="flex items-center bg-green-100 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    {s}
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => setFormData(prev => ({...prev, services: prev.services?.filter(service => service !== s)}))}
                                                            className="ml-2 text-primary hover:text-red-500"
                                                        >
                                                            &times;
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </ProfileField>
                            </div>
                            <div className="px-4 sm:px-6">
                                <h3 className="text-lg font-medium text-gray-900 mt-6">Payment Information</h3>
                                <ProfileField label="Bank Name" value={formData.bankName} isEditing={isEditing}>{renderValueOrInput('bankName', 'text', { maxLength: 50 })}</ProfileField>
                                <ProfileField label="Account Number" value={formData.accountNumber} isEditing={isEditing}>{renderValueOrInput('accountNumber', 'text', { pattern: "[0-9]{10}", title: "Please enter your 10-digit NUBAN account number.", minLength: 10, maxLength: 10 })}</ProfileField>
                            </div>
                            
                            <div className="px-4 sm:px-6">
                                <h3 className="text-lg font-medium text-gray-900 mt-6">Job History</h3>
                                {isLimitReached ? (
                                    <div className="py-4 text-center text-gray-600 bg-gray-50 rounded-lg border mt-2">
                                            <p className="font-semibold">Your job history is hidden.</p>
                                            <p className="text-sm">Please upgrade your subscription plan to view your history and accept more jobs.</p>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                            {user.bookingHistory && user.bookingHistory.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {user.bookingHistory.map((item) => (
                                                        <li key={item.id} className="p-4 bg-gray-50 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex-grow">
                                                                <div className="flex justify-between items-center font-semibold">
                                                                    <span className="text-gray-800">{item.service}</span>
                                                                    <span className="text-primary">₦{item.amount.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm mt-1">
                                                                    <span className="text-gray-500">for {item.clientName}</span>
                                                                     <span className="text-gray-500">{item.date}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                                                                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                                    item.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                                                                    item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {item.status}
                                                                </span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 py-2">No jobs yet.</p>
                                            )}
                                    </div>
                                )}
                            </div>

                        </dl>
                    </div>
                </div>
            )}
            {activeTab === 'reviews' && (
                 <div className="bg-white rounded-lg shadow-lg p-6">
                     <h2 className="text-2xl font-bold text-dark mb-4">My Reviews & Ratings</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-center">
                        <div className="p-4 bg-light rounded-lg">
                            <p className="text-sm text-gray-500">Overall Rating</p>
                            <div className="flex items-center justify-center mt-1">
                                <StarIcon className="w-6 h-6 text-yellow-400"/>
                                <p className="text-3xl font-bold ml-1">{avgRating.toFixed(1)}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-light rounded-lg">
                            <p className="text-sm text-gray-500">Timeliness</p>
                            <p className="text-3xl font-bold mt-1">{avgTimeliness.toFixed(1)}</p>
                        </div>
                        <div className="p-4 bg-light rounded-lg">
                            <p className="text-sm text-gray-500">Thoroughness</p>
                            <p className="text-3xl font-bold mt-1">{avgThoroughness.toFixed(1)}</p>
                        </div>
                        <div className="p-4 bg-light rounded-lg">
                            <p className="text-sm text-gray-500">Conduct</p>
                            <p className="text-3xl font-bold mt-1">{avgConduct.toFixed(1)}</p>
                        </div>
                     </div>
                     <h3 className="text-xl font-semibold text-dark mb-4">Client Feedback ({reviews.length})</h3>
                      {reviews.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {reviews.map((review, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{review.reviewerName}</p>
                                        <div className="flex items-center">
                                            <StarIcon className="w-5 h-5 text-yellow-400" />
                                            <span className="ml-1 font-bold">{review.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    {review.comment && <p className="text-sm text-gray-600 mt-2 italic">"{review.comment}"</p>}
                                </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">You have not received any reviews yet.</p>
                      )}
                 </div>
            )}
        </div>
    );
};