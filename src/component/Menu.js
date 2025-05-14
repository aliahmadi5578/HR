import { Link } from "react-router-dom";

export default function Menu() {
  const signOut = () => {
    localStorage.removeItem("manager");
    localStorage.removeItem("token");
    window.location.replace("/login");
  };
  let menuBar = document.getElementById("cafeRightMenu");
  function handleMenuBar() {
    menuBar.classList.toggle("d-none");
    menuBar.classList.toggle("myAnimate");
  }
  return (
    <div
      className="col-xl-6 col-12 rounded d-flex justify-content-around align-items-center gap-3 cafeTopMenu bold"
      id="noPrint"
    >
      <button className="btn d-xl-none" id="menuBar" onClick={handleMenuBar}>
        ☰
      </button>
      <Link to="/">ثبت فاکتور</Link>
      <Link to="/log">گزارش گیری</Link>
      <button className="btn" onClick={() => signOut()}>
        خروج
      </button>
    </div>
  );
}
