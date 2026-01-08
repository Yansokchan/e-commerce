"use client";
import {
  Search,
  ShoppingCart,
  User,
  Users,
  LogOut,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import {
  openLoginModal,
  completeOnboarding,
  openEditProfileModal,
} from "@/lib/features/auth/authSlice";
import Switch from "./ui/menuButton";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cartCount = useSelector((state) => state.cart.total);
  const dispatch = useDispatch();
  const supabase = createClient();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [router]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  const handleLogout = async () => {
    try {
      console.log("Logout clicked");
      dispatch(completeOnboarding()); // Clear onboarding state

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        alert("Error logging out: " + error.message);
      } else {
        console.log("Logout successful");
        // Use window.location for a hard redirect to clear all state
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout exception:", err);
      alert("Error logging out");
    }
  };

  const UserInfoBlock = () => (
    <div className="px-4 py-3 text-sm text-slate-700 relative group">
      <button
        onClick={() => {
          dispatch(openEditProfileModal());
          setDropdownOpen(false);
        }}
        className="absolute glass-btn top-2 right-2 p-1.5 text-slate-800 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all"
        title="Edit Profile"
      >
        <Pencil size={14} />
      </button>

      <div className="font-semibold text-lg text-slate-900 truncate pr-6">
        {user?.user_metadata?.full_name || "User"}
      </div>
      <div className="text-slate-700 truncate">
        <div className="text-slate-700 mt-1 flex items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Email:
          </span>
          {user?.email}
        </div>
      </div>
      {user?.user_metadata?.phone && (
        <div className="text-slate-700 mt-1 flex items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Phone:
          </span>{" "}
          {user.user_metadata.phone}
        </div>
      )}
      {user?.user_metadata?.location && (
        <div className="text-slate-700 mt-1 flex items-start gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider mt-0.5">
            Address:
          </span>
          <span className="break-words max-w-[200px]">
            {user.user_metadata.location}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <nav className="relative bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm z-50">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">
          <Link
            href="/"
            className="relative text-4xl font-semibold text-slate-700"
          >
            <span className="text-pink-600">socheath</span>store
            <span className="text-pink-600 text-5xl leading-0">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link
              href="/shop"
              className="hover:text-pink-600 transition-colors"
            >
              Shop
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden clay-element-search xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            {user && (
              <>
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2 text-slate-600 hover:text-pink-600 transition-colors"
                >
                  <ShoppingCart size={18} />
                  My Cart
                  <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                    {cartCount}
                  </button>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-slate-600 hover:text-pink-600 transition-colors"
                >
                  <User size={18} />
                  My Orders
                </Link>
              </>
            )}

            {user ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all"
                >
                  <img
                    src={
                      user?.user_metadata?.avatar_url ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user?.user_metadata?.full_name?.split(" ")[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute p-1 right-0 mt-2 w-72 clay-element-nav backdrop-blur-3xl bg-slate-100 rounded-xl ring-[.5px] ring-offset ring-white/20 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <UserInfoBlock />

                    <div className="border-t border-gray-200"></div>

                    <div className="flex justify-between items-center py-3 px-4">
                      <p className="text-xs text-red-600">Want to sign out?</p>
                      <button
                        onClick={handleLogout}
                        className="flex glass-btn rounded-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch(openLoginModal())}
                className="px-8 py-2 glass-btn text-pink-600 rounded-full"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile User Button  */}
          <div className="sm:hidden flex items-center gap-4 z-50 profile-dropdown relative">
            {user ? (
              <>
                <Switch checked={dropdownOpen} onChange={toggleDropdown} />

                {dropdownOpen && (
                  <div className="absolute top-12 right-0 w-72 backdrop-blur-3xl clay-element-nav bg-slate-100 rounded-xl ring-[.5px] ring-offset ring-white/20 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 p-4">
                      <img
                        src={
                          user?.user_metadata?.avatar_url ||
                          "https://ui-avatars.com/api/?name=User"
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="overflow-hidden">
                        <div className="font-semibold text-slate-900 truncate">
                          {user?.user_metadata?.full_name || "User"}
                        </div>
                        <div className="text-xs text-slate-700 truncate">
                          {user?.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(openEditProfileModal());
                          setDropdownOpen(false);
                        }}
                        className="ml-auto p-2 clay-element text-slate-700 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>

                    <div className="mx-4 text-xs text-slate-700 pb-3 space-y-1">
                      {user?.user_metadata?.phone && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold uppercase tracking-wider">
                            Phone:
                          </span>{" "}
                          {user.user_metadata.phone}
                        </div>
                      )}
                      {user?.user_metadata?.location && (
                        <div className="flex items-start gap-1">
                          <span className="font-semibold uppercase tracking-wider">
                            Address:
                          </span>
                          <span className="break-words max-w-[180px]">
                            {user.user_metadata.location}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t  border-gray-300/50"></div>

                    <div className="py-1">
                      <Link
                        href="/shop"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/30"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Search size={16} />
                        Shop
                      </Link>
                      <Link
                        href="/cart"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/30"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShoppingCart size={16} />
                        My Cart
                        <span className="ml-auto clay-element backdrop-blur-3xl text-pink-600 text-xs px-2 py-0.5 rounded-full">
                          {cartCount}
                        </span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50/30"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} />
                        My Orders
                      </Link>
                    </div>

                    <div className="border-t border-gray-300/50"></div>

                    <div className="flex justify-between items-center py-3 px-4">
                      <p className="text-xs text-red-600">Want to sign out?</p>
                      <button
                        onClick={handleLogout}
                        className="flex px-6 py-2 glass-btn items-center rounded-full gap-3 text-sm text-red-600 hover:bg-red-400/30 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => dispatch(openLoginModal())}
                className="px-5 py-2 glass-btn text-pink-600 rounded-full"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
