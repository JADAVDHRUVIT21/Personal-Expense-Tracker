import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Refresh user data from localStorage
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      setUser(null)
      return null
    }

    try {
      // getCurrentUser is now synchronous in authService.js
      const currentUser = getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (error) {
      logoutUser()
      setUser(null)
      throw error
    }
  }, [])

  // Initialize auth on app load
  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        const token = localStorage.getItem('access_token')

        if (token) {
          const currentUser = getCurrentUser()
          if (active) setUser(currentUser)
        }
      } catch {
        logoutUser()
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    await loginUser(email, password)
    return refreshUser()
  }

  const register = async (userData) => {
    // Register the user
    const response = await registerUser(userData)
    
    // Automatically log them in after registration if the backend allows it
    // (If your backend requires manual login after registration, remove the login call below)
    try {
      await loginUser(userData.email, userData.password)
      await refreshUser()
    } catch (err) {
      console.log("Auto-login failed, user needs to log in manually.")
    }

    return response
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }

  return context
}