import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: `http://192.168.11.11:3000/api/manager`,
  headers: {
    "Content-Type": "application/json",
  },
  transformRequest: [
    (data, headers) => {
      if (localStorage.getItem("token")) {
        headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
      }
      if (data instanceof Object) {
        Object.keys(data).forEach((key) => {
          if (
            data[key] === null ||
            data[key] === undefined ||
            data[key] === ""
          ) {
            delete data[key];
          }
          // make commas between numbers each 3 digits
          if (typeof data[key] === "string") {
            data[key].replace(
              /[\u0660-\u0669\u06f0-\u06f9]/g, // Detect all Persian/Arabic Digit in range of their Unicode with a global RegEx character set
              function (a) {
                return a.charCodeAt(0) & 0xf;
              }
              // Remove the Unicode base(2) range that not match
            );

            if (data[key].match(/^[0-9,]*$/g)) {
              data[key] = data[key].replace(/[^0-9]/g, "");
            }
          }
        });
      }
      return JSON.stringify(data);
    },
  ],
});
AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("customer");
      localStorage.removeItem("manager");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default AxiosInstance;
