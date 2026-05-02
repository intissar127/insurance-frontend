import api from "./api";

export const login = async (email, password) => {
    const response = await api.post("/Account/login", {
        email,
        password
    });

    return response.data;
};

export const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
};