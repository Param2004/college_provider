import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
// const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
// const [day, month, yearAndTime] = now.split('/');
// const [year, currentTime] = yearAndTime.split(', ');
// console.log("Time:", currentTime);
const now = new Date()
const pad1 = (n) => n.toString().padStart(2, '0');
const year1 = now.getFullYear();
const month1 = pad1(now.getMonth() + 1);
const day1 = pad1(now.getDate());
const currentDate = `${year1}-${month1.padStart(2, '0')}-${day1.padStart(2, '0')}`;

const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
const istNow = new Date(now.getTime()- istOffset);
const localDate = new Date(istNow);
// Convert to ISO string manually using India timezone
const pad = (n) => n.toString().padStart(2, '0');
const year = localDate.getFullYear();
const month = pad(localDate.getMonth() + 1); // Months are 0-indexed
const day = pad(localDate.getDate());
const hours = pad(localDate.getHours());
const minutes = pad(localDate.getMinutes());
const seconds = pad(localDate.getSeconds());
const isoIST = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;



const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userProfile");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [decodedToken, setDecodedToken] = useState(null);
  const [userProfile, setUserProfile] = useState(userData ? JSON.parse(userData) : null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if(decoded) setDecodedToken(decoded);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          handleLogout();
        } else {
          setIsLoggedIn(true);
          // setUserProfile(decoded);
          if (userData) {
          setUserProfile(JSON.parse(userData));
          }

          const timeout = (decoded.exp - now) * 1000;
          const logoutTimer = setTimeout(() => {
            handleLogout();
          }, timeout);

          return () => clearTimeout(logoutTimer);
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("authToken");
      }
    }
  }, [navigate, token]);

  

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        apiUrl,
        decodedToken,
        isoIST,
        currentDate,
        isLoggedIn,
        setIsLoggedIn,
        // userData,
        userProfile,
        setUserProfile,
        isDropdownOpen,
        setIsDropdownOpen,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);