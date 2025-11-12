import React, { useState, useMemo, useEffect } from 'react';
import { User, Booking, Receipt } from '../types';
import { UserGroupIcon, StarIcon } from './icons';
import { UserDetailsModal } from './UserDetailsModal';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import { ReceiptViewerModal } from './ReceiptViewerModal';


interface AdminDashboardProps {
    allUsers: User[];
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onMarkAsPaid: (bookingId: string) => void;
    onConfirmPayment: (bookingId: string) => void;
    onApproveSubscription: (userId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, onUpdateUser, onDeleteUser, onMarkAsPaid, onConfirmPayment, onApproveSubscription }) => {
    const [activeTab, setActiveTab] = useState<'clients' | 'cleaners' | 'payments' | 'confirmations' | 'allBookings'>('clients');
    const [searchTerm, setSearchTerm] = useState('');
    const [userToView, setUserToView] = useState<User | null>(null);
    const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [receiptToView, setReceiptToView] = useState<Receipt | null>(null);

    const allBookings = useMemo(() => {
        return allUsers.flatMap(u => u.bookingHistory || []).sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
    }, [allUsers]);

    const users = useMemo(() => {
        return allUsers.filter(user => {
            if (user.isAdmin) return false;
            const term = searchTerm.toLowerCase();
            return user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
        });
    }, [searchTerm, allUsers]);
    
    const clients = users.filter(u => u.role === 'client');
    const cleaners = users.filter(u => u.role === 'cleaner');

    const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending'>('all');

    const filteredPayments = useMemo(() => {
        const escrowBookings = allBookings.filter(b => b.paymentMethod === 'Escrow');
        if (paymentFilter === 'pending') {
            return escrowBookings.filter(b => b.paymentStatus === 'Pending Payout');
        }
        return escrowBookings;
    }, [allBookings, paymentFilter]);


    // Data for Confirmations tab
    const pendingPaymentConfirmations = allBookings.filter(b => b.paymentStatus === 'Pending Admin Confirmation');
    const pendingSubscriptionApprovals = allUsers.filter(u => u.pendingSubscription && u.subscriptionReceipt);

    interface UserTableProps {
        users: User[];
        onView: (user: User) => void;
        onSuspend: (user: User) => void;
        onDelete: (user: User) => void;
    }

    const UserTable: React.FC<UserTableProps> = ({ users, onView, onSuspend, onDelete }) => {
        const isCleanerTable = users[0]?.role === 'cleaner';
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            {isCleanerTable && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                    <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.isSuspended ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                     }`}>
                                        {user.isSuspended ? 'Suspended' : 'Active'}
                                     </span>
                                </td>
                                {isCleanerTable && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(() => {
                                            const reviews = user.reviewsData || [];
                                            if (reviews.length === 0) {
                                                return <span className="text-sm text-gray-500">No reviews</span>;
                                            }
                                            const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                                            return (
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                                                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                                                    <span className="text-gray-500 ml-1">({reviews.length})</span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.clientType === 'Company' || user.cleanerType === 'Company'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.clientType || user.cleanerType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onView(user)} className="text-primary hover:text-secondary">View</button>
                                    <button onClick={() => onSuspend(user)} className="ml-4 text-yellow-600 hover:text-yellow-900">{user.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
                                    <button onClick={() => onDelete(user)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    const PaymentTable: React.FC<{ bookings: Booking[] }> = ({ bookings }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.clientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.cleanerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{booking.totalAmount?.toLocaleString() || booking.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.paymentStatus}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {booking.paymentStatus === 'Pending Payout' && (
                                    <button onClick={() => onMarkAsPaid(booking.id)} className="bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-secondary">Mark as Paid</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
             {bookings.length === 0 && <p className="text-center text-gray-500 p-4">No records found.</p>}
        </div>
    );

    const ConfirmationPaymentTable: React.FC<{ bookings: Booking[]}> = ({ bookings }) => (
         <div>
            <h3 className="text-xl font-semibold p-4">Payment Confirmations (Escrow)</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.clientName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.cleanerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{booking.totalAmount?.toLocaleString() || booking.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.paymentReceipt ? (
                                        <button onClick={() => setReceiptToView(booking.paymentReceipt!)} className="text-primary hover:underline">
                                            {booking.paymentReceipt.name}
                                        </button>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onConfirmPayment(booking.id)} className="bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-secondary">Confirm Payment</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {bookings.length === 0 && <p className="text-center text-gray-500 p-4">No records found.</p>}
            </div>
        </div>
    );
    
    const getJobStatusBadge = (status: Booking['status']) => {
        switch(status) {
            case 'Upcoming': return 'bg-indigo-100 text-indigo-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    const getPaymentStatusBadge = (status: Booking['paymentStatus']) => {
        switch(status) {
            case 'Pending Payment': return 'bg-yellow-100 text-yellow-800';
            case 'Pending Admin Confirmation': return 'bg-blue-100 text-blue-800';
            case 'Confirmed': return 'bg-teal-100 text-teal-800';
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Pending Payout': return 'bg-purple-100 text-purple-800';
            case 'Not Applicable': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const SubscriptionTable: React.FC<{ users: User[], onApprove: (userId: string) => void }> = ({ users, onApprove }) => (
        <div>
            <h3 className="text-xl font-semibold p-4">Subscription Approvals</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaner Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.pendingSubscription}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.subscriptionReceipt ? (
                                        <button onClick={() => setReceiptToView(user.subscriptionReceipt!)} className="text-primary hover:underline">
                                            {user.subscriptionReceipt.name}
                                        </button>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onApprove(user.id)} className="bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-secondary">Approve Upgrade</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="text-center text-gray-500 p-4">No pending approvals.</p>}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                 <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
                    <UserGroupIcon className="w-8 h-8"/>
                    Admin Dashboard
                </h1>
                <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

             <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`${
                            activeTab === 'clients'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Manage Clients ({clients.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('cleaners')}
                        className={`${
                            activeTab === 'cleaners'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Manage Cleaners ({cleaners.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`${
                            activeTab === 'payments'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('confirmations')}
                        className={`${
                            activeTab === 'confirmations'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Confirmations ({pendingPaymentConfirmations.length + pendingSubscriptionApprovals.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('allBookings')}
                        className={`${
                            activeTab === 'allBookings'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                       All Bookings ({allBookings.length})
                    </button>
                </nav>
            </div>
            
            <div className="mt-8 bg-white shadow-md rounded-lg">
                {activeTab === 'clients' && <UserTable users={clients} onView={setUserToView} onSuspend={setUserToSuspend} onDelete={setUserToDelete} />}
                {activeTab === 'cleaners' && <UserTable users={cleaners} onView={setUserToView} onSuspend={setUserToSuspend} onDelete={setUserToDelete} />}
                {activeTab === 'payments' && (
                    <div>
                        <div className="p-4 flex items-center justify-between">
                             <h3 className="text-xl font-semibold">Payment History (Escrow)</h3>
                             <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                                <button onClick={() => setPaymentFilter('all')} className={`px-3 py-1 text-sm font-medium rounded-md ${paymentFilter === 'all' ? 'bg-white shadow' : 'text-gray-600'}`}>All</button>
                                <button onClick={() => setPaymentFilter('pending')} className={`px-3 py-1 text-sm font-medium rounded-md ${paymentFilter === 'pending' ? 'bg-white shadow' : 'text-gray-600'}`}>Pending Payout</button>
                             </div>
                        </div>
                        <PaymentTable bookings={filteredPayments} />
                    </div>
                )}
                 {activeTab === 'confirmations' && (
                    <div>
                        <ConfirmationPaymentTable 
                            bookings={pendingPaymentConfirmations} 
                        />
                        <div className="border-t mt-4">
                            <SubscriptionTable users={pendingSubscriptionApprovals} onApprove={onApproveSubscription} />
                        </div>
                    </div>
                )}
                 {activeTab === 'allBookings' && (
                     <div>
                        <h3 className="text-xl font-semibold p-4">All Bookings History</h3>
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleaner</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {allBookings.map(b => (
                                        <tr key={b.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.clientName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.cleanerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.service}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{b.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col gap-1 items-start">
                                                     <span className="text-xs">{b.paymentMethod}</span>
                                                     <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getPaymentStatusBadge(b.paymentStatus)}`}>
                                                        {b.paymentStatus}
                                                     </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${getJobStatusBadge(b.status)}`}>
                                                    {b.status}
                                                 </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                     </div>
                )}
            </div>
            
            {userToView && <UserDetailsModal user={userToView} onClose={() => setUserToView(null)} />}

            {userToSuspend && (
                <AdminConfirmationModal
                    title={userToSuspend.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                    message={`Are you sure you want to ${userToSuspend.isSuspended ? 'unsuspend' : 'suspend'} ${userToSuspend.fullName}? ${userToSuspend.isSuspended ? '' : 'They will not be able to log in.'}`}
                    confirmText={userToSuspend.isSuspended ? 'Unsuspend' : 'Suspend'}
                    onConfirm={() => {
                        onUpdateUser({ ...userToSuspend, isSuspended: !userToSuspend.isSuspended });
                        setUserToSuspend(null);
                    }}
                    onClose={() => setUserToSuspend(null)}
                    confirmButtonClass="bg-yellow-600 hover:bg-yellow-500 focus-visible:outline-yellow-600"
                />
            )}

            {userToDelete && (
                <AdminConfirmationModal
                    title="Delete User"
                    message={`Are you sure you want to permanently delete ${userToDelete.fullName}? This action cannot be undone.`}
                    confirmText="Delete"
                    onConfirm={() => {
                        onDeleteUser(userToDelete.id);
                        setUserToDelete(null);
                    }}
                    onClose={() => setUserToDelete(null)}
                    confirmButtonClass="bg-red-600 hover:bg-red-500 focus-visible:outline-red-600"
                />
            )}
            
            {receiptToView && <ReceiptViewerModal receipt={receiptToView} onClose={() => setReceiptToView(null)} />}

        </div>
    );
};
