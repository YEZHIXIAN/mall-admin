import http from '@/utils/httpRequest';

export function uploadFile(fileName) {
  return new Promise((resolve, reject) => {
    http({
      url: http.adornUrl("/third-party/s3/upload"),
      method: "get",
      params: { fileName },  // Send the file name as a parameter
      headers: { 'Content-Type': 'application/json' }  // Ensure correct content type for GET requests
    }).then(({ data }) => {
      resolve(data);  // The response should contain the signature, policy, etc.
    }).catch(error => {
      reject(error);  // Handle errors
    });
  });
}
