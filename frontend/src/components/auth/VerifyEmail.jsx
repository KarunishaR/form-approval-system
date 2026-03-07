import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to dashboard...');
          
          setTimeout(() => {
            if (response.user.role === 'student') {
              navigate('/student/dashboard');
            } else if (response.user.role === 'staff') {
              if (!response.user.staffId || !response.user.approvalLevel) {
                navigate('/staff/complete-profile');
              } else {
                navigate('/staff/dashboard');
              }
            }
          }, 2000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl text-center">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center">
              <Loader className="h-16 w-16 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-primary inline-block"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;