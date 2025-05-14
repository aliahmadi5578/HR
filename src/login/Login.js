import { useForm } from "react-hook-form";
import "../App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const successNotify = () => toast.success("خوش آمدید");
  const errorNotify = () => toast.error("نام کاربری یا کلمه عبور اشتباه است");

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loginFormData = () => {
    debugger
    if (isOnline) {
      const user = getValues("username");
      if (process.env.React_App_User_List.split(",").indexOf(user) != -1) {
        axios
          .post("http://192.168.11.11:3000/api/manager/auth/login", {
            username: getValues("username"),
            password: getValues("password"),
          })
          .then(function (response) {
            if ((response.data.status = "200")) {
              successNotify();
              localStorage.setItem(
                "manager",
                JSON.stringify(response.data.data.manager)
              );

              localStorage.setItem("token", response.data.data.token);
              navigate("/");
            }
          })
          .catch(function (error) {
            if ((error.response.status = "401")) {
              errorNotify();
            }
          });
      } else {
        toast.error("شما دسترسی به این پنل ندارید !");
      }
    } else {
      toast.error("اتصال شبکه را بررسی کنید");
    }
  };

  const [inputText, setInputText] = useState("◉");

  function showInputLoginPass() {
    var passInput = document.getElementById("passLoginInput");
    var passButton = document.getElementById("passButton");
    if (passInput.type === "password") {
      passInput.type = "text";
      setInputText("◎");
    } else {
      passInput.type = "password";
      setInputText("◉");
    }
  }

  return (
    <>
      <div className="loginSection d-flex justify-content-center align-items-center dirRtl bold">
        <div className="loginFormSection bg-white row d-flex justify-content-center align-items-center col-10 col-lg-6 p-3 rounded">
          <h1>ورود به پنل کاربری</h1>
          <form
            onSubmit={handleSubmit(loginFormData)}
            className="row d-flex loginForm gap-3 justify-content-center"
          >
            <input
              className="col-12 px-2"
              placeholder="نام کاربری"
              type="text"
              {...register("username", { required: true })}
            />
            {errors.username && <span>وارد کردن این فیلد اجباری است</span>}
            <div className="d-flex px-0 justify-content-end align-items-center">
              <input
                className="col-12 px-2 inputTextLeft"
                id="passLoginInput"
                placeholder="کلمه عبور"
                type="password"
                {...register("password", { required: true })}
              />
              <button
                className="btn showOrHideButton"
                type="button"
                id="passButton"
                onClick={showInputLoginPass}
              >
                {inputText}
              </button>
            </div>
            {errors.password && <span>وارد کردن این فیلد اجباری است</span>}
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary loginBtn col-md-4 col-8"
                type="submit"
              >
                ورود
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
