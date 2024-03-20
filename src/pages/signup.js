import React from 'react';
import SignupModalContent from '../components/signup/signupModal';

const SignupPage = () => {
  const handleModalClose = () => {
    // Redirect to homepage or login page after successful signup or modal close
  };

  return (
    <div>
      <SignupModalContent onClose={handleModalClose} />
    </div>
  );
};

export default SignupPage;
