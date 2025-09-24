import React, { useState } from 'react';
import styled from 'styled-components';

const AdminContainer = styled.div`
  background: #1a1a2e;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 24px;
  margin: 16px 0;
  color: #ffffff;
`;

const AdminHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #30363d;
`;

const AdminTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const AdminForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const Select = styled.select`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
  }
`;

const TextArea = styled.textarea`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
  }
  
  &::placeholder {
    color: #6b7280;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? '#1f6feb' : '#30363d'};
  border: 1px solid ${props => props.variant === 'primary' ? '#1f6feb' : '#30363d'};
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#1158c7' : '#40464d'};
    border-color: ${props => props.variant === 'primary' ? '#1158c7' : '#40464d'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GeneratedLicense = styled.div`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
`;

const LicenseKey = styled.div`
  background: #1a1a2e;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #4ade80;
  text-align: center;
  margin: 8px 0;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: #1f6feb;
  border: 1px solid #1f6feb;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1158c7;
    border-color: #1158c7;
  }
`;

const ErrorMessage = styled.div`
  background: #5f1a1a;
  border: 1px solid #dc2626;
  border-radius: 6px;
  padding: 12px;
  color: #f87171;
  font-size: 14px;
  margin-top: 16px;
`;

const SuccessMessage = styled.div`
  background: #1a5f1a;
  border: 1px solid #16a34a;
  border-radius: 6px;
  padding: 12px;
  color: #4ade80;
  font-size: 14px;
  margin-top: 16px;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #6b7280;
  border-top: 2px solid #1f6feb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    adminKey: '',
    clientName: '',
    clientEmail: '',
    licenseType: 'monthly',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateLicense = async (e) => {
    e.preventDefault();
    
    if (!formData.adminKey || !formData.clientName || !formData.clientEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/license/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_key: formData.adminKey,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          license_type: formData.licenseType,
          notes: formData.notes
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedLicense(result);
        setSuccess(`License key generated successfully for ${result.client_name}`);
        setFormData(prev => ({
          ...prev,
          clientName: '',
          clientEmail: '',
          notes: ''
        }));
      } else {
        setError(result.message || 'Failed to generate license key');
      }
    } catch (err) {
      setError(`Failed to generate license: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('License key copied to clipboard!');
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  return (
    <AdminContainer>
      <AdminHeader>
        <AdminTitle>🔧 Admin Panel - License Generator</AdminTitle>
      </AdminHeader>

      <AdminForm onSubmit={generateLicense}>
        <InputGroup>
          <Label htmlFor="adminKey">Admin Key *</Label>
          <Input
            id="adminKey"
            name="adminKey"
            type="password"
            value={formData.adminKey}
            onChange={handleInputChange}
            placeholder="Enter admin key"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="clientName">Client Name *</Label>
          <Input
            id="clientName"
            name="clientName"
            type="text"
            value={formData.clientName}
            onChange={handleInputChange}
            placeholder="Enter client name"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="clientEmail">Client Email *</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={handleInputChange}
            placeholder="Enter client email"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="licenseType">License Type</Label>
          <Select
            id="licenseType"
            name="licenseType"
            value={formData.licenseType}
            onChange={handleInputChange}
          >
            <option value="monthly">Monthly (1 month)</option>
            <option value="quarterly">Quarterly (3 months)</option>
            <option value="yearly">Yearly (12 months)</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <TextArea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes about this license..."
          />
        </InputGroup>

        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : '🔑'} Generate License Key
        </Button>
      </AdminForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {generatedLicense && (
        <GeneratedLicense>
          <h4 style={{ color: '#ffffff', margin: '0 0 16px 0' }}>Generated License Key</h4>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e5e7eb' }}>Client:</strong> {generatedLicense.client_name}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e5e7eb' }}>Email:</strong> {generatedLicense.client_email}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e5e7eb' }}>Type:</strong> {generatedLicense.license_type}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#e5e7eb' }}>Expiry:</strong> {new Date(generatedLicense.expiry_date).toLocaleDateString()}
          </div>
          
          <LicenseKey>
            {generatedLicense.license_key}
          </LicenseKey>
          
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <CopyButton onClick={() => copyToClipboard(generatedLicense.license_key)}>
              📋 Copy License Key
            </CopyButton>
          </div>
        </GeneratedLicense>
      )}
    </AdminContainer>
  );
};

export default AdminPanel;
