import axios from "axios";

const axiosInstance = axios.create({
	// We set this to "/api" so that all requests go to the Vite Proxy.
	// The proxy (in vite.config.js) then forwards them to localhost:5000.
	baseURL: "/api",
	withCredentials: true, // Required to send cookies (for login)
});

export default axiosInstance;