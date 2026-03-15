import React from "react";

const EmptyCard = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-20 min-h-screeen w-full">
      
      <img
        src="https://i.pinimg.com/1200x/0f/d2/10/0fd21023361b413eb4bf32cc620d20bb.jpg"
        alt="empty"
        className="w-60 opacity-80"
      />

      <p className="max-w-md text-sm font-medium text-slate-700 text-center mt-5 leading-7">
        {message}
      </p>

    </div>
  );
};

export default EmptyCard;