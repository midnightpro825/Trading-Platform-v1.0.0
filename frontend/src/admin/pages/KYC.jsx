import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KYC = () => {
  // ===== STATE =====
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ===== FETCH KYC REQUESTS =====
  useEffect(() => {
    fetchKYC();
    fetchStats();
  }, []);

  const fetchKYC = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/admin/kyc/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKycRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching KYC:', error);
      // Fallback mock data
      setKycRequests([
        {
          id: 1,
          username: 'Alice Johnson',
          email: 'alice@email.com',
          level: 2,
          status: 'pending',
          submitted: '2024-07-20 14:30:22',
          documents: ['ID Front', 'ID Back', 'Selfie'],
          idType: 'Passport',
          idNumber: 'AB1234567',
          country: 'United States',
          dob: '1990-05-15',
          riskScore: 'Low',
          notes: 'First KYC submission'
        },
        {
          id: 2,
          username: 'Bob Smith',
          email: 'bob@email.com',
          level: 1,
          status: 'pending',
          submitted: '2024-07-19 10:15:45',
          documents: ['ID Front'],
          idType: 'Drivers License',
          idNumber: 'DL9876543',
          country: 'United Kingdom',
          dob: '1985-12-20',
          riskScore: 'Medium',
          notes: 'Basic KYC'
        },
        {
          id: 3,
          username: 'Charlie Lee',
          email: 'charlie@email.com',
          level: 3,
          status: 'pending',
          submitted: '2024-07-18 08:00:10',
          documents: ['Passport', 'Proof of Address', 'Selfie'],
          idType: 'Passport',
          idNumber: 'CZ9876543',
          country: 'Canada',
          dob: '1988-08-10',
          riskScore: 'Low',
          notes: 'Advanced KYC - Large volume trader'
        },
        {
          id: 4,
          username: 'Diana Park',
          email: 'diana@email.com',
          level: 2,
          status: 'approved',
          submitted: '2024-07-16 22:20:15',
          documents: ['ID Front', 'ID Back', 'Selfie'],
          idType: 'National ID',
          idNumber: 'PK1234567',
          country: 'South Korea',
          dob: '1992-03-25',
          riskScore: 'Low',
          notes: 'Approved - VIP user'
        },
        {
          id: 5,
          username: 'Ethan Wu',
          email: 'ethan@email.com',
          level: 1,
          status: 'rejected',
          submitted: '2024-07-15 14:05:33',
          documents: ['ID Front'],
          idType: 'Drivers License',
          idNumber: 'DL4567890',
          country: 'Australia',
          dob: '1995-07-30',
          riskScore: 'High',
          notes: 'Rejected - Document quality poor'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setStats({
          pending: response.data.pendingKYC || 0,
          approved: response.data.approvedKYC || 0,
          rejected: response.data.rejectedKYC || 0,
          total: response.data.totalKYC || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  // ===== KYC ACTIONS =====
  const handleAction = async (action, request) => {
    console.log(`🔘 ${action} clicked for KYC:`, request);

    switch(action) {
      case 'view':
        setSelectedRequest(request);
        setShowDetailModal(true);
        break;

      case 'approve':
        if (confirm(`✅ Approve KYC for ${request.username}?`)) {
          try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8081/api/admin/kyc/${request.id}/approve`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert(`✅ KYC approved for ${request.username}`);
            fetchKYC();
            fetchStats();
          } catch (error) {
            alert('❌ Error: ' + error.message);
          }
        }
        break;

      case 'reject':
        setRejectId(request.id);
        setRejectReason('');
        setShowRejectModal(true);
        break;

      case 'aml-check':
        alert(`🔍 AML check initiated for ${request.username}\nRisk Score: ${request.riskScore || 'Calculating...'}`);
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  // ===== CONFIRM REJECT =====
  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8081/api/admin/kyc/${rejectId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`❌ KYC rejected`);
      setShowRejectModal(false);
      setRejectId(null);
      setRejectReason('');
      fetchKYC();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== FILTER KYC =====
  const filteredRequests = kycRequests.filter(request => {
    const matchesSearch = (request.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (request.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (request.idNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || request.level === parseInt(filterLevel);
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f0b90b';
      case 'approved': return '#0ecb81';
      case 'rejected': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getLevelLabel = (level) => {
    switch(level) {
      case 1: return 'Basic';
      case 2: return 'Verified';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '🔄';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading KYC requests...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>🪪 KYC Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Verify user identities and manage KYC applications</p>

      {/* Stats Summary */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Pending</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', color: '#f0b90b' }}>Waiting for review</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Approved</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{stats.approved}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>Verified users</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Rejected</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>{stats.rejected}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>Need resubmission</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#627eea' }}>All applications</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            flex: 1,
            minWidth: '200px',
            fontSize: '14px'
          }}
        />
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Levels</option>
          <option value="1">Level 1 (Basic)</option>
          <option value="2">Level 2 (Verified)</option>
          <option value="3">Level 3 (Advanced)</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
        </select>
        <button
          onClick={() => { setSearchTerm(''); setFilterLevel('all'); setFilterStatus('all'); }}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#848e9c',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
        <button
          onClick={fetchKYC}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#848e9c',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* KYC Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Level</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>ID Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Documents</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Country</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Submitted</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No KYC requests found</p>
                </td>
              </tr>
            ) : (
              paginatedRequests.map(request => (
                <tr key={request.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ color: '#eaecef' }}>{request.username}</div>
                      <div style={{ fontSize: '11px', color: '#848e9c' }}>{request.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: request.level === 3 ? 'rgba(240,185,11,0.2)' : 'rgba(255,255,255,0.04)',
                      color: request.level === 3 ? '#f0b90b' : '#848e9c',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getLevelLabel(request.level)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#eaecef' }}>{request.idType}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <span style={{ color: '#eaecef' }}>{request.documents?.length || 0} files</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#eaecef' }}>{request.country}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: getStatusColor(request.status) + '20',
                      color: getStatusColor(request.status),
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusIcon(request.status)} {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#848e9c' }}>
                    {request.submitted ? new Date(request.submitted).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction('view', request)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction('approve', request)}
                            style={{ padding: '4px 8px', background: '#0ecb81', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleAction('reject', request)}
                            style={{ padding: '4px 8px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleAction('aml-check', request)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="AML Check"
                      >
                        🔍
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          marginTop: '8px'
        }}>
          <span style={{ color: '#848e9c', fontSize: '13px' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                background: currentPage === 1 ? 'transparent' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                color: currentPage === 1 ? '#848e9c' : '#eaecef',
                cursor: currentPage === 1 ? 'default' : 'pointer'
              }}
            >
              ◀
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  background: currentPage === i + 1 ? '#f0b90b' : 'transparent',
                  border: currentPage === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  color: currentPage === i + 1 ? '#0a0b0e' : '#848e9c',
                  cursor: 'pointer',
                  fontWeight: currentPage === i + 1 ? '600' : '400'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                background: currentPage === totalPages ? 'transparent' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                color: currentPage === totalPages ? '#848e9c' : '#eaecef',
                cursor: currentPage === totalPages ? 'default' : 'pointer'
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0a0b0e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>🪪 KYC Application</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#f0b90b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700',
                color: '#0a0b0e'
              }}>
                {selectedRequest.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#eaecef' }}>{selectedRequest.username}</div>
                <div style={{ color: '#848e9c' }}>{selectedRequest.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    background: getStatusColor(selectedRequest.status) + '20',
                    color: getStatusColor(selectedRequest.status),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getStatusIcon(selectedRequest.status)} {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                  <span style={{
                    background: selectedRequest.level === 3 ? 'rgba(240,185,11,0.2)' : 'rgba(255,255,255,0.04)',
                    color: selectedRequest.level === 3 ? '#f0b90b' : '#848e9c',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Level {selectedRequest.level} - {getLevelLabel(selectedRequest.level)}
                  </span>
                </div>
              </div>
            </div>

            {/* KYC Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>ID Type</span><div style={{ color: '#eaecef' }}>{selectedRequest.idType}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>ID Number</span><div style={{ color: '#eaecef' }}>{selectedRequest.idNumber}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Country</span><div style={{ color: '#eaecef' }}>{selectedRequest.country}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Date of Birth</span><div style={{ color: '#eaecef' }}>{selectedRequest.dob}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Risk Score</span>
                <div style={{
                  color: selectedRequest.riskScore === 'Low' ? '#0ecb81' :
                         selectedRequest.riskScore === 'Medium' ? '#f0b90b' : '#f6465d'
                }}>
                  {selectedRequest.riskScore || 'Calculating...'}
                </div>
              </div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Submitted</span><div style={{ color: '#eaecef' }}>{selectedRequest.submitted}</div></div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Documents</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedRequest.documents?.map((doc, i) => (
                    <span key={i} style={{
                      padding: '4px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#eaecef'
                    }}>
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Notes</span>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  color: '#848e9c',
                  fontSize: '13px'
                }}>
                  {selectedRequest.notes || 'No notes'}
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { handleAction('reject', selectedRequest); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => { handleAction('approve', selectedRequest); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}
                >
                  ✅ Approve
                </button>
              </div>
            )}
            <button
              onClick={() => setShowDetailModal(false)}
              style={{ marginTop: '12px', padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== REJECT MODAL ===== */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0a0b0e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>❌ Reject KYC</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  color: '#eaecef',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmReject} style={{ padding: '8px 20px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;