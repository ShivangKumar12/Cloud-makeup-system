import axios from "axios";

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001" 
});

export const uploadImage = async (file: File | Blob) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await API.post("/upload", formData);
  return res.data;
};

export const fetchFiles = async (): Promise<string[]> => {
  const res = await API.get("/files");
  return res.data;
};

export const deleteFile = async (url: string) => {
  const filename = url.split("/").pop();
  return await API.delete(`/delete/${filename}`);
};
