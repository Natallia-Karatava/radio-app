import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false); // To store the authorization status

  useEffect(() => {
    if (user) {
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true); // If there is a user, it means he is authorized
    } else {
      setIsAuthenticated(false); // If there is no user, not authorized
    }
  }, [user]);
  // Function for user registration
  const registerUser = (name, email, password) => {
    const newUser = { name, email, password };
    setUser(newUser);
  };

  // Function for user login
  const loginUser = (email, password) => {
    // Check email and password if there is a match
    const savedEmail = localStorage.getItem("userEmail");
    const savedPassword = localStorage.getItem("userPassword");

    if (savedEmail === email && savedPassword === password) {
      const userData = {
        name: localStorage.getItem("userName"),
        email: savedEmail,
        password: savedPassword,
      };
      setUser(userData);
    } else {
      setIsAuthenticated(false);
    }
  };

  // Function for user exit
  const logoutUser = () => {
    setUser(null); // Remove the user from the state
    localStorage.removeItem("user");
    setIsAuthenticated(false); // Reset authorization status
  };

  return (
    <UserContext.Provider
      value={{ user, isAuthenticated, registerUser, loginUser, logoutUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
