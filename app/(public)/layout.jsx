"use client";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import OnboardingModal from "@/components/OnboardingModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import { useDispatch, useSelector } from "react-redux";
import { completeOnboarding } from "@/lib/features/auth/authSlice";

export default function PublicLayout({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const needsOnboarding = useSelector((state) => state.auth.needsOnboarding);

  // Initial auth check handles profile fetching in AuthProvider

  const handleOnboardingComplete = () => {
    dispatch(completeOnboarding());
  };

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
      <LoginModal />
      <ProfileEditModal />
      {needsOnboarding && user && (
        <OnboardingModal user={user} onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}
