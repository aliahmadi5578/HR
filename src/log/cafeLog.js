import { useEffect, useRef, useState } from "react";
import TextBox from "../component/textBox/TextBox";
import axios from "axios";
import Comma from "../utility/Comma";
import { toast } from "react-toastify";
import MD5 from "crypto-js/md5";
import { Datepicker } from "@ijavad805/react-datepicker";
import { format, toDate } from "date-fns-jalali";
import Pagination from "../component/pagination";
import { Link } from "react-router-dom";
import Menu from "../component/Menu";
import { apiKey, userName, dbName } from "../component/Data";

export default function CafeLog() {
  const converter = (text) =>
    text.replace(/[٠-٩۰-۹]/g, (a) => a.charCodeAt(0) & 15);

  let date = Date.now();
  const [startDate, setStartDate] = useState(
    converter(
      new Intl.DateTimeFormat("fa", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date)
    )
  );
  const [endDate, setEndDate] = useState(
    converter(
      new Intl.DateTimeFormat("fa", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date)
    )
  );
  const [endPrice, setEndPrice] = useState();
  const [taxPrice, setTaxPrice] = useState();
  const [discPrice, setDiscPrice] = useState();
  const [logType, setLogType] = useState(10);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState();
  const [result, setResult] = useState([]);
  const [customer, setCustomer] = useState(30502);

  useEffect(() => {
    if (result.length == 0 && !errorText) {
      handleGetReport();
    }
    let totalPrice = result.reduce(
      (accumulator, current) => accumulator + parseInt(current.TotalAmount),
      0
    );
    setEndPrice(totalPrice);
    let totalTax = result.reduce(
      (accumulator, current) => accumulator + parseInt(current.tax_amt),
      0
    );
    setTaxPrice(totalTax);

    let totalDisc = result.reduce(
      (accumulator, current) => accumulator + parseInt(current.discount),
      0
    );
    setDiscPrice(totalDisc);
  }, [result]);

  const dateTime = new Date();
  const newDate =
    dateTime.toISOString().slice(0, 10) +
    " " +
    dateTime.getHours() +
    ":" +
    dateTime.getMinutes() +
    ":" +
    dateTime.getSeconds();

  const dataForFactorLogWh = {
    DB_Name: dbName,
    User_Name: userName,
    Date: newDate,
    key: MD5(userName, newDate, apiKey),
    Function: "get_customer_inquiry",
    Params: {
      from_date: startDate,
      to_date: endDate,
      customer: customer,
      type: logType,
    },
  };

  const handleStartDate = (firstDate) => {
    let dateStartFormat = new Intl.DateTimeFormat("fa", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(firstDate);
    setStartDate(converter(dateStartFormat));
  };

  const handleEndDate = (toDate) => {
    let dateEndFormat = new Intl.DateTimeFormat("fa", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(toDate);
    setEndDate(converter(dateEndFormat));
  };

  const handleGetReport = async () => {
    setLoading(true);
    const response = await fetch(
      `/includes/webservices/webhesab_webservice.php`,
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForFactorLogWh),
      }
    );
    try {
      const res = await response.json();
      setResult(res.response);
      if (res.response.length == 0) {
        setErrorText("موردی یافت نشد");
      } else setErrorText("");
    } catch (err) {
      toast.error("مشکلی به وجود آمده است");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  let body = document.getElementById("body");
  loading ? body.classList.add("fadeBody") : body.classList.remove("fadeBody");

  const PaginatedList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = result.slice(startIndex, startIndex + itemsPerPage);
    return (
      <>
        {loading && (
          <div className="text-center spiner">
            <div className="spinner-border" role="status">
              <span className="sr-only" style={{ zIndex: "1000" }}></span>
            </div>
          </div>
        )}
        <div className="table-responsive heliumResponsiveTable" id="printDiv">
          <table className="table heliumTable default">
            <thead>
              <tr>
                <th scope="col">ردیف</th>
                <th scope="col">نوع</th>
                <th scope="col">شماره فاکتور</th>
                <th scope="col">کد پیگیری</th>
                <th scope="col">تاریخ</th>
                <th scope="col">مشتری</th>
                <th scope="col">محل</th>
                <th scope="col">مجموع</th>
                <th scope="col">تخفیف</th>
              </tr>
            </thead>
            {!loading && result && (
              <tbody>
                {currentItems.map((items, index) => {
                  return (
                    <>
                      <tr
                        key={index + 1}
                        className={items.type == 11 ? "table-danger" : ""}
                      >
                        <th scope="row">{index + 1}</th>
                        <td className="bold">
                          {items.type == 11 ? "فاکتور مرجوعی" : "فاکتور فروش"}
                        </td>
                        <td className="bold transNo">
                          <button value={items.trans_no}>
                            {items.trans_no}
                          </button>
                        </td>
                        <td className="bold transNo">
                          <button value={items.reference}>
                            {items.reference}
                          </button>
                        </td>
                        <td>
                          {format(
                            items.tran_date.replaceAll("-", "/"),
                            "yyyy/MM/dd"
                          )}
                        </td>
                        <td>{items.name}</td>
                        <td>{items.location_name}</td>
                        <td className="bold">
                          {Comma(parseInt(items.TotalAmount))} ریال
                        </td>
                        <td>{Comma(parseInt(items.discount))} ریال</td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        <div className="d-flex justify-content-center row col-12 bold">
          {errorText}
        </div>
        <Pagination
          totalItems={result.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </>
    );
  };

  return (
    <>
      <div className="d-flex p-2 justify-content-center">
        <div className="d-flex justify-content-center align-items-center gap-2 row col-12">
          <Menu />
          <div className="d-flex justify-content-center bold default">
            گزارش کافه
          </div>
          <hr className="w-75" style={{ margin: "0" }} />
          <div class="d-flex flex-row flex-wrap align-items-center justify-content-center bold">
            <div class="p-2 d-flex gap-2 align-items-center">
              <span>مشتری :</span>
              <select
                className="heDropDown d-flex justify-content-between align-items-center cafeInput logDate"
                name="customer"
                label="مشتری"
                aria-label="customer"
                disabled={loading}
                onChange={(e) => setCustomer(e.target.value)}
                defaultValue="30502"
              >
                <option value="">انتخاب کنید</option>
                <option value="30502">مشتری متفرقه کافه</option>
                <option value="30785">تولد تهران</option>
                <option value="30786">پکیچ تهران</option>
                <option value="30784">توریست تهران</option>
              </select>
            </div>
            <div class="p-2 d-flex gap-2 align-items-center">
              <span>از :</span>
              <Datepicker
                input={
                  <TextBox text={startDate} id="FromDate" className="logDate" />
                }
                onChange={handleStartDate}
                adjustPosition={"modal"}
                disabled={loading}
                name="fromDate"
              />
            </div>
            <div class="p-2 d-flex gap-2 align-items-center">
              <span>تا :</span>
              <Datepicker
                input={
                  <TextBox text={endDate} id="toDate" className="logDate" />
                }
                onChange={handleEndDate}
                adjustPosition={"modal"}
                disabled={loading}
                name="toDate"
              />
            </div>
            <div class="p-2 d-flex gap-2 align-items-center">
              <span>نوع :</span>
              <select
                className="heDropDown d-flex justify-content-between align-items-center logDate"
                onChange={(e) => setLogType(e.target.value)}
                disabled={loading}
                defaultValue="10"
                name="logType"
              >
                <option value="1">پرداخت</option>
                <option value="2">دریافت</option>
                <option value="10">فاکتور فروش</option>
                <option value="11">فاکتور مرجوعی</option>
                <option value="12">پرداخت مشتری</option>
                <option value="13">کسر از انبار</option>
                <option value="20">فاکتور خرید</option>
                <option value="22">پرداخت به عرضه کننده</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "120px" }}
              onClick={handleGetReport}
              disabled={loading}
            >
              جستجو
            </button>
          </div>

          <div className="d-flex gap-2 bold mt-3 justify-content-around">
            <div>
              مجموع کل :
              <span style={{ letterSpacing: "4px" }}>{Comma(endPrice)}</span>{" "}
              ریال
            </div>
            {/* <div>
            <span style={{color : "red" , fontSize:"10px"}}>Removed*</span>
              مجموع مالیات :
              <span style={{ letterSpacing: "4px" }}>{Comma(taxPrice)}</span>{" "}
              ریال
            </div>
            <div>
            <span style={{color : "red" , fontSize:"10px"}}>New*</span>
              مجموع مالیات :
              <span style={{ letterSpacing: "4px" }}>{Comma(endPrice * 10 / 100)}</span>{" "}
              ریال
            </div> */}
            <div>
              مجموع تخفیف :
              <span style={{ letterSpacing: "4px" }}>{Comma(discPrice)}</span>{" "}
              ریال
            </div>
          </div>
          <PaginatedList />
          <button
            className="btn btn-primary scrollUp"
            disabled={result.length == 0 || result.length < 10}
            onClick={() => {
              if (window.scrollY == 0) {
                window.scrollTo({
                  left: 0,
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            &#8597;
          </button>
        </div>
      </div>
    </>
  );
}
