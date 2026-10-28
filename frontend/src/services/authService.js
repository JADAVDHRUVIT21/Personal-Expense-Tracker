import api from "./api";

// 1. Register User
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// 2. Login User
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login/form", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const token = response.data.access_token;

  if (!token) {
    throw new Error("The server did not return an access token.");
  }

  // Save the token
  localStorage.setItem("access_token", token);

  // Fetch the user profile immediately after login and save it
  try {
    const userResponse = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.setItem("user", JSON.stringify(userResponse.data));
  } catch (error) {
    console.error("Failed to fetch user profile after login", error);
  }

  return response.data;
};

// 3. Get Current User
export const getCurrentUser = async () => {
  // First, check if we have the user saved in localStorage
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    return JSON.parse(storedUser);
  }

  // If not, fetch from the backend
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Save it for next time
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    // If the token is invalid/expired, clear it
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    return null;
  }
};

// 4. Logout User
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};