import { useState, useEffect } from 'react';
import { Moon, Sun, User, Lock, Star, Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

export default function Component() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [hasPasswordInput, setHasPasswordInput] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

   // Hardcoded credentials
   const validCredentials = {
    admin: {
      username: 'admin',
      password: 'admin123',
      redirect: '/Screen/admin'
    },
    receptionist: {
      username: 'azka',
      password: 'azka123',
      redirect: '/Screen/receptionist'
    },
    accountant: {
      username: 'maryam',
      password: 'maryam456',
      redirect: '/Screen/accountant'
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      const encryptedData = {
        role: CryptoJS.AES.encrypt(data.role, 'secret-key').toString(),
        username: CryptoJS.AES.encrypt(data.username, 'secret-key').toString(),
        password: CryptoJS.AES.encrypt(data.password, 'secret-key').toString()
      };
      
      console.log('Encrypted login data:', encryptedData);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials against hardcoded values
      const roleCredentials = validCredentials[data.role];
      if (!roleCredentials) {
        throw new Error('Invalid role selected');
      }

      if (data.username === roleCredentials.username && 
          data.password === roleCredentials.password) {
        // Store login state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', data.role);
        
        // Navigate to the appropriate dashboard
        navigate(roleCredentials.redirect);
      } else {
        if (data.username !== roleCredentials.username) {
          throw new Error('Invalid username');
        } else {
          throw new Error('Invalid password');
        }
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setLoginError(
        error.message.includes('username') 
          ? "Invalid username. Please try again." 
          : error.message.includes('password')
          ? "Invalid password. Please try again."
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', newMode);
  };

  const handleUsernameInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');
  };

  const handlePasswordChange = (e) => {
    setHasPasswordInput(e.target.value.length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const interval = setInterval(() => {
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => {
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isDarkMode]);

  const validateUsername = (value) => {
    const usernameRegex = /^[A-Za-z]+$/;
    return usernameRegex.test(value) || "Username must contain only alphabets.";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 text-gray-100 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="star absolute text-yellow-200"
            initial={{ opacity: Math.random(), scale: Math.random() * 0.5 + 0.5 }}
            animate={{
              opacity: [Math.random(), 1, Math.random()],
              scale: [Math.random() * 0.5 + 0.5, Math.random() * 0.7 + 0.7, Math.random() * 0.5 + 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          >
            <Star size={Math.random() * 4 + 1} />
          </motion.div>
        ))}
      </div>
      <nav className="relative z-10 flex items-center justify-between p-4 bg-opacity-30 bg-black backdrop-filter backdrop-blur-lg">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/images/hotel.PNG" alt="Hotel Icon" className="h-8 w-8" />
          <span className="text-xl font-bold text-yellow-100">Cosmic Stay</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button onClick={toggleDarkMode} className="text-yellow-100">
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </motion.div>
      </nav>

      <main className="container relative z-10 mx-auto mt-12 px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-md mx-auto bg-opacity-30 bg-black backdrop-filter backdrop-blur-lg border-opacity-50 border-gray-300 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-center text-yellow-100">Welcome to the Cosmos</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4" onKeyDown={handleKeyDown}>
              <div className="space-y-2">
                <label htmlFor="role" className="text-yellow-100">Roles</label>
                <div className="relative">
                  <select 
                    id="role" 
                    className="w-full bg-opacity-70 bg-black text-white border border-yellow-500 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none"
                    {...register("role", { required: "Role is required." })}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setIsDropdownOpen(false)}
                    defaultValue=""
                  >
                    <option value="" disabled className="text-white">Select your role</option>
                    <option value="accountant" className="text-white bg-gray-900">Accountant</option>
                    <option value="admin" className="text-white bg-gray-900">Admin</option>
                    <option value="receptionist" className="text-white bg-gray-900">Receptionist</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {isDropdownOpen ? <ChevronUp className="text-yellow-500" /> : <ChevronDown className="text-yellow-500" />}
                  </div>
                </div>
                {errors.role && <span className="text-sm text-red-500 font-medium">{errors.role.message}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-yellow-100">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" size={18} />
                  <input 
                    id="username" 
                    className="pl-10 w-full bg-opacity-70 bg-black text-white border border-yellow-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-white" 
                    placeholder="Enter your username" 
                    maxLength={15}
                    onInput={handleUsernameInput}
                    {...register("username", { 
                      required: "Username is required.",
                      maxLength: {
                        value: 15,
                        message: "Username must be less than 15 characters."
                      },
                      validate: validateUsername
                    })} 
                  />
                </div>
                {errors.username && <span className="text-sm text-red-500 font-medium">{errors.username.message}</span>}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-yellow-100">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" size={18} />
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 w-full bg-opacity-70 bg-black text-white border border-yellow-500 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-white" 
                    placeholder="Enter your Password" 
                    maxLength={15}
                    {...register("password", { 
                      required: "Password is required.",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters."
                      },
                      maxLength: {
                        value: 15,
                        message: "Password must be less than 15 characters."
                      }
                    })}
                    onChange={handlePasswordChange}
                  />
                  {hasPasswordInput && (
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {errors.password && <span className="text-sm text-red-500 font-medium">{errors.password.message}</span>}
              </div>
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500 rounded-md text-red-100 text-center"
                >
                  {loginError}
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-indigo-900 font-bold py-2 rounded" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    'Launch into the System'
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 mt-12 text-center text-sm text-yellow-200">
        © 2025 Cosmic Hotel Management System. All rights reserved across the galaxy.
      </footer>
    </div>
  );
}