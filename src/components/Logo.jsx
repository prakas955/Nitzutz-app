import React from 'react';

const Logo = ({ className = "h-8 w-8" }) => {
  return (
    <div className={`${className} flex items-center`}>
      <img 
        src="/nitzutzlogo.png" 
        alt="Nitzutz Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
