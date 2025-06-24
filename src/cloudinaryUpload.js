import axios from 'axios';

const CLOUD_NAME = 'djsaxy3g0';
const UPLOAD_PRESET = 'aluminus'; // create one in Cloudinary > Settings > Upload

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
  return res.data.secure_url; // This is the image URL to save in Firebase
};
