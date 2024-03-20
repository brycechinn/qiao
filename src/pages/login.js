import React from 'react';
import LoginModalContent from '../components/signup/loginModal';

const LoginPage = () => {
  const handleModalClose = () => {
    // Redirect to homepage or login page after successful signup or modal close
  };

  return (
    <div>
      <LoginModalContent onClose={handleModalClose} />
    </div>
  );
};

export default LoginPage;
