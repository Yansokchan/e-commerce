import React from "react";
import Title from "./Title";
import RippleButton from "./ui/ripple-button";

const Newsletter = () => {
  return (
    <div className="flex flex-col items-center mx-4 my-36">
      <Title
        title="Join Newsletter"
        description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week."
        visibleButton={false}
      />
      <div className="flex clay-element bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10">
        <input
          className="flex-1 pl-5 outline-none"
          type="text"
          placeholder="Enter your email address"
        />
        <RippleButton className="font-medium bg-gradient-to-r from-pink-600 to-pink-500 ring-1 ring-inset ring-slate-200/50 shadow-xl text-white px-5 py-3 rounded-full hover:scale-103 active:scale-95 transition">
          Get Updates
        </RippleButton>
      </div>
    </div>
  );
};

export default Newsletter;
