import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  chunk_size: 100000000, // 100 MB 
  timeout: 1000000 // 10 minutes
});

// Function to upload multiple images
export const uploadImages = async (imageFiles) => {
  try {
    const uploadPromises = imageFiles.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary image upload error:', error);
              reject(new Error('Error uploading image to Cloudinary'));
            } else {
              // console.log('Image upload result:', result); // Log the upload result
              resolve(result);
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    return uploadResults;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
