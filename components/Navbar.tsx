'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ShoppingCart, User, Menu, X, LogOut, Search } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import getUserSession from "@/actions/auth/getUserSession";
import logoutAction from "@/actions/auth/logout";
import { useRouter } from "next/navigation";
import { IUserEntity } from "oneentry/dist/users/usersInterfaces";
import { log } from "console";

export default function Navbar() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<IUserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const userData = await getUserSession();
        if (userData) setUser(userData as IUserEntity);
        setIsLoading(false);
      } catch (error) {
        console.error({error});
        setUser(null);
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Close navbar when clicking outside of it or any item in it (except search)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
      
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    };     
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/');
    setUser(null);
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length) {
      router.push(`/search?searchTerm=${searchQuery}`);
      setIsMobileMenuOpen(false); // Close mobile menu on search
    }
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu on item click
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          
          {/* Logo Section */}
          <div className='flex items-center'>
            <Link href='/' className='flex-shrink-0 group'>
              <span className='text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-red-600 transition-all duration-300'>
                ClickNCart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-6 flex-1 justify-end max-w-4xl'>
            
            {/* Search Bar */}
            <div className='flex-1 max-w-md mx-8'>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type='text'
                    placeholder='Search products...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='bg-gray-50/80 border-gray-200 pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-gray-100/80'
                  />
                </div>
              </form>
            </div>

            {/* Cart Button */}
            <div className="flex items-center">
              <Link href='/cart' onClick={handleMenuItemClick}>
                <Button
                  size='icon'
                  className='relative bg-gray-50/80 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-600 transition-all duration-200 rounded-full h-10 w-10'
                  variant='ghost'
                >
                  <ShoppingCart className='h-5 w-5' />
                  {/* {cartItems.length > 0 && (
                    <span className='absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full min-w-[18px] h-[18px] shadow-lg'>
                      {cartItems.length}
                    </span>
                  )} */}
                </Button>
              </Link>
            </div>

            {/* User Authentication Section */}
            {isLoading && (
              <div className='flex items-center'>
                <div className="animate-pulse">
                  <Avatar className='h-10 w-10 border-2 border-gray-200'>
                    <AvatarFallback className='bg-gradient-to-r from-gray-300 to-gray-400'>
                      <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='relative h-10 w-10 rounded-full hover:ring-2 hover:ring-purple-500/20 transition-all duration-200'
                  >
                    <Avatar className='h-10 w-10 cursor-pointer border-2 border-transparent hover:border-purple-300 transition-all duration-200'>
                      <AvatarFallback className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold text-sm transition-all duration-200'>
                        {user.formData
                          .find(
                            (f): f is { marker: 'name'; value: string } =>
                              f.marker === 'name'
                          )
                          ?.value.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-64 p-2 bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl rounded-xl' align='end' forceMount>
                  <DropdownMenuLabel className='font-normal p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-2'>
                    <div className='flex flex-col space-y-2'>
                      <p className='text-sm font-semibold leading-none bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                        {
                          user.formData.find(
                            (f): f is { marker: 'name'; value: string } =>
                              f.marker === 'name'
                          )?.value
                        }
                      </p>
                      <p className='text-xs leading-none text-gray-500'>
                        {user?.identifier}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-gradient-to-r from-purple-200 to-pink-200 h-px' />
                  <DropdownMenuItem className='focus:bg-purple-50 focus:text-purple-700 rounded-lg my-1 cursor-pointer transition-all duration-150'>
                    <Link href='/profile' className='flex w-full items-center py-1'>
                      <User className='mr-3 h-4 w-4' />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className='focus:bg-purple-50 focus:text-purple-700 rounded-lg my-1 cursor-pointer transition-all duration-150'>
                    <Link href='/orders' className='flex w-full items-center py-1'>
                      <ShoppingCart className='mr-3 h-4 w-4' />
                      <span className="font-medium">Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='bg-gradient-to-r from-purple-200 to-pink-200 h-px my-2' />
                  <DropdownMenuItem
                    className='focus:bg-red-50 focus:text-red-700 rounded-lg cursor-pointer transition-all duration-150'
                    onClick={handleLogout}
                  >
                    <LogOut className='mr-3 h-4 w-4' />
                    <span className="font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!user && isLoading === false && (
              <div className='flex items-center space-x-3'>
                <Link href='/auth?type=login'>
                  <Button
                    variant='outline'
                    className='bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent border-2 border-purple-200 hover:border-purple-300 cursor-pointer px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:shadow-md hover:bg-purple-50/50'
                  >
                    Login
                  </Button>
                </Link>
                <Link href='/auth?type=signup'>
                  <Button className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white cursor-pointer px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105'>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center'>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className='h-6 w-6 text-gray-600' />
              ) : (
                <Menu className='h-6 w-6 text-gray-600' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className='md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-lg'>
          <div className='px-4 pt-4 pb-3 space-y-3'>
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className='mb-4'>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type='text'
                  placeholder='Search products...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='bg-gray-50 border-gray-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200'
                />
              </div>
            </form>

            {/* Mobile Cart Link */}
            <Link
              href='/cart'
              className='flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200 group'
              onClick={handleMenuItemClick}
            >
              <ShoppingCart className='mr-3 h-5 w-5 group-hover:text-white' />
              <span>Cart</span>
            </Link>
          </div>

          {/* Mobile User Section */}
          <div className='border-t border-gray-200/50 pt-4 pb-3'>
            {user && (
              <div className='flex items-center px-5 mb-4 p-3 mx-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl'>
                <div className='flex-shrink-0'>
                  <Avatar className='h-12 w-12 border-2 border-purple-200'>
                    <AvatarFallback className='bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold'>
                      {user.formData
                        .find(
                          (f): f is { marker: 'name'; value: string } =>
                            f.marker === 'name'
                        )
                        ?.value.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className='ml-4'>
                  <div className='text-base font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                    {
                      user.formData.find(
                        (f): f is { marker: 'name'; value: string } =>
                          f.marker === 'name'
                      )?.value
                    }
                  </div>
                  <div className='text-sm font-medium text-gray-500'>
                    {user?.identifier}
                  </div>
                </div>
              </div>
            )}
            
            {user ? (
              <div className='mt-3 px-4 space-y-2'>
                <Link
                  href='/profile'
                  className='flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200 group'
                  onClick={handleMenuItemClick}
                >
                  <User className='mr-3 h-5 w-5 group-hover:text-white' />
                  <span>Your Profile</span>
                </Link>

                <Link
                  href='/orders'
                  className='flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200 group'
                  onClick={handleMenuItemClick}
                >
                  <ShoppingCart className='mr-3 h-5 w-5 group-hover:text-white' />
                  <span>Orders</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className='flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 transition-all duration-200 cursor-pointer group'
                >
                  <LogOut className='mr-3 h-5 w-5 group-hover:text-white' />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className='mt-3 px-4 space-y-2'>
                <Link
                  href='/auth?type=login'
                  className='flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200 group'
                  onClick={handleMenuItemClick}
                >
                  <User className='mr-3 h-5 w-5 group-hover:text-white' />
                  <span>Login</span>
                </Link>
                
                <Link
                  href='/auth?type=signup'
                  className='flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-200 group'
                  onClick={handleMenuItemClick}
                >
                  <User className='mr-3 h-5 w-5 group-hover:text-white' />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}