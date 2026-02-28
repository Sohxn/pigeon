import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleGmailCallback } from '@/lib/google_auth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      navigate('/dashboard');
      return;
    }

    if (code) {
      handleGmailCallback(code)
        .then((success) => {
          if (success) {
            navigate('/dashboard');
          } else {
            navigate('/dashboard');
          }
        })
        .catch(() => {
          navigate('/dashboard');
        });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white text-xl">waiting</p>
    </div>
  );
}