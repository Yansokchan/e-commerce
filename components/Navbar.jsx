"use client";
import { Search, ShoppingCart, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import { openLoginModal } from "@/lib/features/auth/authSlice";

const Navbar = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const cartCount = useSelector((state) => state.cart.total);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="relative bg-white border-b border-gray-200">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">
          <Link
            href="/"
            className="relative text-4xl font-semibold text-slate-700"
          >
            <span className="text-green-600">go</span>cart
            <span className="text-green-600 text-5xl leading-0">.</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
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

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600"
            >
              <ShoppingCart size={18} />
              Cart
              <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                {cartCount}
              </button>
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/orders"
                  className="flex items-center gap-2 hover:text-indigo-600"
                >
                  <User size={18} />
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 border border-slate-300 hover:bg-slate-50 transition text-slate-600 rounded-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => dispatch(openLoginModal())}
                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile User Button  */}
          <div className="sm:hidden flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600"
            >
              <ShoppingCart size={18} />
              <span className="absolute -top-1 right-[-4px] text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
            {user ? (
              <button onClick={handleLogout} className="text-sm font-medium">
                Logout
              </button>
            ) : (
              <button
                onClick={() => dispatch(openLoginModal())}
                className="px-5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
