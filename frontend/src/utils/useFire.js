// const baseURL = "http://localhost:3000";

// export const fireApi = async (endpoint, method, data = null) => {
//     const token = localStorage. getItem("user-visited-dashboard");

//     // if (!token) {
//     //     throw new Error("No token found in localStorage");
//     // }

//     const headers = {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//     };

//     const options = {
//         method: method,
//         headers,
//         body: data ? JSON.stringify(data) : null
//     };


//     try {
//         const response = await fetch(`${baseURL}${endpoint}`, options);
//         console.log(response, 'response'); // Log the response

//         if (response.status >= 200 && response.status < 300) {
//             return response.json();
//         } else {
//             const json = await response.json();
//             throw new Error(json.message || response.statusText);
//         }
//     } catch (error) {
//         console.error('Error in fireApi:', error);
//         throw error;
//     }
// };



// const baseURL = "http://192.168.18.35:3000";
// const baseURL = "http://localhost:3000";
const baseURL = "https://unilink-backend.onrender.com";

export const fireApi = async (endpoint, method, data = null) => {
    const token = localStorage.getItem("user-visited-dashboard");
    
    // Prepare headers
    const headers = {};

    // Only add Authorization if token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    };
    
    // Determine content type
    if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    };

    const options = {
        method: method,
        headers,
        body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : null
    };

    try {
        const response = await fetch(`${baseURL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || response.statusText);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error in fireApi:', error);
        throw error;
    }
};

