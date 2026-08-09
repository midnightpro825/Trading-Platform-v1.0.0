import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Deposits = () => {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/api/admin/deposits?status=pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeposits(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const approveDeposit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8081/api/admin/deposits/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Deposit approved!');
            fetchDeposits();
        } catch (err) {
            alert('❌ Error approving deposit: ' + err.message);
        }
    };

    const rejectDeposit = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (reason === null) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8081/api/admin/deposits/${id}/reject`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Deposit rejected');
            fetchDeposits();
        } catch (err) {
            alert('❌ Error rejecting deposit: ' + err.message);
        }
    };

    if (loading) return <div className="loading">Loading deposits...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="admin-deposits">
            <h2>💰 Deposit Management</h2>
            
            {deposits.length === 0 ? (
                <p className="no-deposits">No pending deposits</p>
            ) : (
                <table className="deposits-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Asset</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deposits.map(dep => (
                            <tr key={dep.id}>
                                <td>#{dep.id}</td>
                                <td>{dep.username}</td>
                                <td>{dep.asset}</td>
                                <td>${dep.amount}</td>
                                <td>{new Date(dep.created_at).toLocaleString()}</td>
                                <td>
                                    <button 
                                        className="btn-approve"
                                        onClick={() => approveDeposit(dep.id)}
                                    >
                                        ✅ Approve
                                    </button>
                                    <button 
                                        className="btn-reject"
                                        onClick={() => rejectDeposit(dep.id)}
                                    >
                                        ❌ Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Deposits;