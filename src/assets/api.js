import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/", // make sure this matches your Express backend route prefix
});

export default api;

