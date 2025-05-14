import { useEffect, useRef, useState } from "react";
import TextBox from "../component/textBox/TextBox";
import Comma from "../utility/Comma";
import { toast } from "react-toastify";
import MD5 from "crypto-js/md5";
import { Datepicker } from "@ijavad805/react-datepicker";
import { format, set } from "date-fns-jalali";
import Menu from "../component/Menu";
import { apiKey, userName, dbName } from "../component/Data";

export default function Home() {
  const [activeItems, setActiveItems] = useState(0);
  const [endPrice, setEndPrice] = useState(0);
  const [itemok, setItemOk] = useState([]);
  const [searchValue, setSearchValue] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [items, setItems] = useState([]);
  const [personnelItems, setPersonnelItems] = useState([]);
  const [isReturned, setReturned] = useState(false);
  const [lastItems, setLastItems] = useState([]);
  const [text, setText] = useState();
  const [customer, setCustomer] = useState(30502);
  const [pager, setPager] = useState(1);
  const [seller, setSeller] = useState(localStorage.getItem("manager"));
  const [loading, setLoading] = useState(false);
  const [randomNumber, setRandomNumber] = useState(
    Math.floor(10000 + Math.random() * 90000)
  );
  const [description, setDescription] = useState("");

  const tableRef = useRef(null);

  const dateTime = new Date();
  const newDate =
    dateTime.toISOString().slice(0, 10) +
    " " +
    dateTime.getHours() +
    ":" +
    dateTime.getMinutes() +
    ":" +
    dateTime.getSeconds();

  const dateForWh = format(dateTime.toISOString().slice(0, 10), "yyyy/MM/dd");

  let hour = new Date().getHours();
  let min =
    new Date().getMinutes() < 10
      ? "0" + new Date().getMinutes()
      : new Date().getMinutes();
  const timeForWh = hour + ":" + min;

  const categoryItems = [
    { name: "قهوه", id: 1 },
    { name: "قهوه سرد", id: 2 },
    { name: "اسپرسو", id: 5 },
    { name: "چای", id: 10 },
    { name: "دمنوش", id: 6 },
    { name: "نوشیدنی داغ", id: 11 },
    { name: "شیک", id: 3 },
    { name: "فراپه", id: 16 },
    { name: "آبمیوه", id: 15 },
    { name: "عرقیات سنتی", id: 14 },
    { name: "دسر", id: 7 },
    { name: "کیک", id: 4 },
    { name: "اسنک ، پنی نی", id: 12 },
    { name: "ساندویچ سرد", id: 8 },
    { name: "یخچال", id: 9 },
    { name: "گیفت و اکسسوری", id: 13 },
  ];

  const dataForProductWh = {
    DB_Name: dbName,
    User_Name: userName,
    Date: newDate,
    key: MD5(userName, newDate, apiKey),
    Function: "get_item_data_webservice",
    Params: {
      stock_id: null,
      price_type: 0,
      show_prop: true,
      show_qty_in_loc: true,
      show_in_loc_stock: false,
      site_code: null,
      technical_code: null,
      page: null,
      page_size: 50,
    },
  };

  const dataForPersonnelProductWh = {
    DB_Name: dbName,
    User_Name: userName,
    Date: newDate,
    key: MD5(userName, newDate, apiKey),
    Function: "get_item_data_webservice",
    Params: {
      stock_id: null,
      price_type: "2",
      show_prop: true,
      show_qty_in_loc: true,
      show_in_loc_stock: false,
      site_code: null,
      technical_code: null,
      page: null,
      page_size: 50,
    },
  };

  const dataForFactorWh = {
    DB_Name: dbName,
    User_Name: userName,
    Date: newDate,
    key: MD5(userName, newDate, apiKey),
    Function: "add_shop_invoice",
    Params: {
      type: isReturned ? 11 : 10,
      customer_id: customer,
      Branch: 304,
      date: dateForWh,
      cust_ref: randomNumber.toString(),
      Comments: description,
      sales_type: 1,
      deliver_to: "",
      delivery_address: "",
      Location: 0,
      saleman: parseInt(seller.username),
      Disc_Total: 0,
      dimension_id: 71,
      dimension2_id: 0,
      tax_total: 0,
      pos: 4,
      time: timeForWh,
      items: itemok,
      date_type: 0,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `/includes/webservices/webhesab_webservice.php`,
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForProductWh),
        }
      );
      const res = await response.json();
      const result = res.response.filter(
        (item) =>
          item.price != null &&
          item.category_name != "مواد اولیه" &&
          item.category_name != "فروشگاه پیست" &&
          item.category_name != "صبحانه پلاس" &&
          item.category_name != "سالاد" &&
          item.category_name != "ساندویچ" &&
          item.category_name != "پیتزا" &&
          item.category_name != "کوکی" &&
          item.category_name != "سیب زمینی" &&
          item.category_name != "پاستا"
      );
      localStorage.setItem("Products", JSON.stringify(result));
      window.location.reload();
    };
    const localItems = localStorage.getItem("Products");
    setItems(JSON.parse(localItems));
    localStorage.getItem("Products") === null && fetchData();

    const fetchPersonnelData = async () => {
      const response = await fetch(
        `/includes/webservices/webhesab_webservice.php`,
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForPersonnelProductWh),
        }
      );
      const res = await response.json();
      const result = res.response.filter(
        (item) =>
          item.price != null &&
          item.category_name != "مواد اولیه" &&
          item.category_name != "فروشگاه پیست" &&
          item.category_name != "صبحانه پلاس" &&
          item.category_name != "سالاد" &&
          item.category_name != "ساندویچ" &&
          item.category_name != "پیتزا" &&
          item.category_name != "کوکی" &&
          item.category_name != "سیب زمینی" &&
          item.category_name != "پاستا"
      );
      localStorage.setItem("PersonnelProducts", JSON.stringify(result));
      window.location.reload();
    };
    const localPersonnelItems = localStorage.getItem("PersonnelProducts");
    setPersonnelItems(JSON.parse(localPersonnelItems));
    localStorage.getItem("PersonnelProducts") === null && fetchPersonnelData();

    let totalPrice = itemok.reduce(
      (accumulator, current) => accumulator + current.endPrice,
      0
    );
    setEndPrice(totalPrice);

    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [itemok]);

  let body = document.getElementById("body");
  loading ? body.classList.add("fadeBody") : body.classList.remove("fadeBody");

  useEffect(() => {
    const storedValue = JSON.parse(localStorage.getItem("manager"));
    setSeller(storedValue);

    document.querySelector(".returnButton").onclick = function () {
      setReturned(true);
    };
    document.querySelector(".addFactorButton").onclick = function () {
      setReturned(false);
    };
  }, []);

  const addFactor = async () => {
    if (seller != null && customer != "") {
      setLoading(true);
      const response = await fetch(
        `/includes/webservices/webhesab_webservice.php`,
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForFactorWh),
        }
      );
      try {
        const res = await response.json();
        if (
          (res.status == "200" || res.status == "done") &&
          res.user_access != false
        ) {
          setLoading(false);
          toast.success("فاکتور با موفقیت ثبت شد");
          setDescription("");
          document.getElementById("description").value = "";
          setItemOk([]);
          handleRandomNumber();
        } else {
          setLoading(false);
          !res.error_msg
            ? toast.error("مشکلی به وجود آمده است")
            : toast.error(res.error_msg);
        }
      } finally {
        setLoading(false);
        if (response.status == "500") {
          toast.error("اتصال شبکه را بررسی کنید");
        }
      }
    } else {
      toast.error("شعبه یا فروشنده را انتخاب کنید");
    }
  };

  const addFactorWithPrint = async () => {
    if (seller != null && customer != "") {
      setLoading(true);
      const response = await fetch(
        `/includes/webservices/webhesab_webservice.php`,
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForFactorWh),
        }
      );
      try {
        setLoading(true);
        const res = await response.json();
        if (
          (res.status == "200" || res.status == "done") &&
          res.user_access != false
        ) {
          toast.error("فاکتور با موفقیت ثبت شد");
          printNow(res.id);
          toast.error("فاکتور با موفقیت ثبت شد");
        } else {
          setLoading(false);
          !res.error_msg
            ? toast.error("مشکلی به وجود آمده است")
            : toast.error(res.error_msg);
        }
      } finally {
        setLoading(false);
        if (response.status == "500") {
          toast.error("اتصال شبکه را بررسی کنید");
        }
      }
    } else {
      toast.error("شعبه یا فروشنده را انتخاب کنید");
    }
  };

  const returnedFactor = async () => {
    if (window.confirm("از ثبت فاکتور مرجوعی اطمینان دارید؟")) {
      if (seller != null && customer != "") {
        setLoading(true);
        const response = await fetch(
          `/includes/webservices/webhesab_webservice.php`,
          {
            method: "POST",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataForFactorWh),
          }
        );
        try {
          const res = await response.json();
          if (
            (res.status == "200" || res.status == "done") &&
            res.user_access != false
          ) {
            setLoading(false);
            toast.success("فاکتور با موفقیت مرجوع شد");
            setDescription("");
            document.getElementById("description").value = "";
            setItemOk([]);
            handleRandomNumber();
          } else {
            setLoading(false);
            !res.error_msg
              ? toast.error("مشکلی به وجود آمده است")
              : toast.error(res.error_msg);
          }
        } finally {
          setLoading(false);
          if (response.status == "500") {
            toast.error("اتصال شبکه را بررسی کنید");
          }
        }
      } else {
        toast.error("شعبه یا فروشنده را انتخاب کنید");
      }
    } else {
      console.log("canceled");
    }
  };

  function handleItemsChange(e) {
    let item = itemok.findIndex(
      (items) => items.item_description == e.target.name
    );
    if (item > -1 && !loading) {
      const updateItems = [...itemok];
      updateItems[item].quantity += 1;
      updateItems[item].endPrice =
        updateItems[item].unit_price * updateItems[item].quantity;
      setItemOk(updateItems);
    } else if (item == -1 && !loading) {
      setItemOk((prev) => [
        ...prev,
        {
          stock_id: e.target.accessKey,
          item_description: e.target.name,
          unit_price: parseInt(e.target.id),
          quantity: parseInt(e.target.role),
          discount: 0,
          description: description,
          endPrice: parseInt(e.target.id * e.target.role),
        },
      ]);
    }
  }

  function handleRandomNumber() {
    setRandomNumber(Math.floor(10000 + Math.random() * 90000));
  }

  function offPersonnel() {
    let offPersonnel = document.getElementById("offPersonnel");
    if (offPersonnel.checked) {
      setLastItems(items);
      setItems(personnelItems);
    } else {
      setItems(lastItems);
    }
  }

  function handleRemoveRow(key) {
    const updatedCardForms = [...itemok];
    updatedCardForms.splice(key, 1);
    setItemOk(updatedCardForms);
  }

  function handleSearchInputChange(e) {
    setSearchValue(e.target.value);
    let filtered = items.filter(
      (item) =>
        item.stock_name.includes(searchValue) ||
        item.stock_id.includes(searchValue)
    );
    setFilteredData(filtered);
    filteredData.length != 0 && setText("موردی یافت نشد");
  }

  function addQuantity(name) {
    let item = itemok.findIndex((items) => items.item_description == name);
    const updateItems = [...itemok];
    updateItems[item].quantity += 1;
    updateItems[item].endPrice =
      updateItems[item].unit_price * updateItems[item].quantity;
    setItemOk(updateItems);
  }
  function subQuantity(name, key) {
    let item = itemok.findIndex((items) => items.item_description == name);
    const updateItems = [...itemok];
    updateItems[item].quantity -= 1;
    updateItems[item].endPrice =
      updateItems[item].unit_price * updateItems[item].quantity;
    setItemOk(updateItems);

    if (updateItems[item].quantity == 0) {
      const updatedCardForms = [...itemok];
      updatedCardForms.splice(key, 1);
      setItemOk(updatedCardForms);
    }
  }
  let serachTextBox = document.getElementById("searchTextBox");

  const pagerNumber = [];
  for (var i = 1; i <= 30; i++) {
    pagerNumber.push(i);
  }

  function itemsButton(items) {
    return (
      <button
        onClick={handleItemsChange}
        name={items.stock_name}
        id={items.price}
        role={items.is_index_stock + 1}
        accessKey={items.stock_id}
      >
        {items.stock_name}
      </button>
    );
  }

  // const handleSellerChange = (e) => {
  //   const newValue = e.target.value;
  //   setSeller(newValue);
  //   localStorage.setItem("Seller", JSON.stringify({ value: newValue }));
  // };

  const printNow = (itemId) => {
    var printContents = document.getElementById("printDiv").outerHTML;
    var printContents2 = document.getElementById("printBDiv").innerHTML;
    var printContents3 = document.getElementById("printCDiv").innerHTML;
    var factorId = document.getElementById("printDDivs");
    factorId.innerHTML = itemId;
    var printContents4 = document.getElementById("printDDiv").innerHTML;
    document.body.innerHTML =
      printContents4 + printContents3 + printContents + printContents2;
    window.print();
    window.location.reload();
  };

  return (
    <>
      {loading && (
        <div class="text-center spiner p-5 w-100">
          <div class="spinner-border" role="status">
            <span className="sr-only" style={{ zIndex: "1000" }}></span>
          </div>
        </div>
      )}
      <div className="d-flex p-2 justify-content-center mainDiv">
        <div className="d-flex justify-content-center align-items-center gap-2 row col-12">
          <Menu />
          <div
            className="d-flex justify-content-center bold default"
            id="noPrint"
          >
            ثبت فاکتور کافی شاپ تهران
          </div>
          <hr className="w-75" style={{ margin: "0" }} />
          <div
            className="my-2 d-flex flex-wrap justify-content-center align-items-center gap-2 bold"
            id="noPrint"
          >
            <span className="bold">مشتری : </span>
            <select
              className="heDropDown d-flex justify-content-between align-items-center cafeInput"
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
            <span className="bold">نام فروشنده : </span>
            <TextBox
              className="heDropDown d-flex justify-content-between align-items-center cafeInput"
              name="seller"
              label="فروشنده"
              aria-label="seller"
              disable
              value={seller.firstname + " " + seller.lastname || ""}
            />
            <span className="bold">کد پیگیری : </span>
            <TextBox
              className="cafeInput"
              id="id"
              disable
              value={randomNumber}
            />
            <span className="bold">تاریخ فاکتور : </span>
            <Datepicker
              input={
                <TextBox
                  ariaLabel="date"
                  className="cafeInput bold"
                  name="date"
                  text="تاریخ"
                />
              }
              value={new Date().setHours(0, 0, 0, 0).valueOf()}
              disabled
            />
            <span className="bold">ساعت فاکتور : </span>
            <span className="bold">{timeForWh}</span>
          </div>
          <div className="row d-flex justify-content-center">
            <div
              className="col-12 col-lg-4 p-3 cafeRightMenu d-none d-xl-block"
              id="cafeRightMenu"
            >
              <form
                className="d-flex gap-2 p-2 justify-content-center align-items-center"
                id="searchForm"
                name="searchForm"
              >
                <TextBox
                  className="d-flex w-100"
                  text="جستجو"
                  onChange={handleSearchInputChange}
                  id="searchTextBox"
                  disable={loading}
                />
                <button
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchValue("");
                    serachTextBox.value = "";
                    setActiveItems(0);
                  }}
                  disabled={loading || searchValue == ""}
                >
                  X
                </button>
              </form>
              <div className="d-flex cafeItemsTitle flex-wrap">
                {categoryItems.map((item) => {
                  return (
                    <button
                      onClick={() => setActiveItems(item.id)}
                      key={item.id}
                      className={
                        activeItems == item.id ? "activeItem" : undefined
                      }
                      disabled={loading}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
              <hr />
              {activeItems == 0 && null}
              <div
                className="d-flex cafeItemsTitle items flex-wrap bold"
                id="noPrint"
              >
                {searchValue.length !== 0 &&
                  filteredData.map((items) => itemsButton(items))}

                {activeItems == 1 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name == "نوشیدنی های گرم" &&
                        item.stock_id != 21036 &&
                        item.stock_id != 21046 &&
                        item.stock_id != 21047 &&
                        item.stock_id != 21048 &&
                        item.stock_id != 21049 &&
                        item.stock_id != 21050 &&
                        item.stock_id != 21052 &&
                        item.stock_id != 21053 &&
                        item.stock_id != 21054 ||
                        item.stock_id == 211001
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 2 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name == "نوشیدنی های سرد" &&
                        item.stock_id != 21102 &&
                        item.stock_id != 211002 &&
                        item.stock_id != 21103 &&
                        item.stock_id != 21112 &&
                        item.stock_id != 21113 &&
                        item.stock_id != 21114 &&
                        item.stock_id != 21115 &&
                        item.stock_id != 21188 &&
                        item.stock_id != 21189
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 3 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        (item.category_name == "شیک ها" ||
                          item.category_name == "شیک های مخصوص")
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 4 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        (item.category_name == "کیک ها و شیرینی ها" ||
                          item.category_name == "کیک ها دسر ها" ||
                          item.category_name == "کیک") &&
                        item.stock_id != 21095 &&
                        item.stock_id != 21099 &&
                        item.stock_id != 21169
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 5 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name == "اسپرسوها" ||
                        (item.category_name == "قهوه" &&
                          item.stock_id != 21172 &&
                          item.stock_id != 21198 &&
                          item.stock_id != 21175 &&
                          item.stock_id != 21186)
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 6 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name == "دمنوش ها" &&
                        item.stock_id != 21015 &&
                        item.stock_id != 21197
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 7 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name == "دسرها" &&
                        item.stock_id != 21057 &&
                        item.stock_id != 21060 &&
                        item.stock_id != 21064 &&
                        item.stock_id != 21065 &&
                        item.stock_id != 21067 ||
                      item.stock_id == 21163 

                    )
                    .map((items) => itemsButton(items))}

                {activeItems == 8 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name ==
                        "اسنک ها پنی نی و ساندویچ سرد وسالاد"
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 9 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.stock_id == 21001 ||
                        item.stock_id == 21002 ||
                        item.stock_id == 21003
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 10 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) => item.stock_id == 21047 || item.stock_id == 21048
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 11 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.stock_id == 21175 ||
                        item.stock_id == 21046 ||
                        item.stock_id == 21036 ||
                        item.stock_id == 21052
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 12 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.category_name ==
                          "اسنک ها پنی نی و ساندویچ سرد و سالاد" &&
                        item.stock_id != 21126 &&
                        item.stock_id != 21127
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 13 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        (item.category_name == "گیفت و اکسسوریز" &&
                          item.stock_id != 21142 &&
                          item.stock_id != 21151 &&
                          item.stock_id != 21154 &&
                          item.stock_id != 21155) ||
                        item.stock_id == 21185
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 14 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) => item.stock_id == 21102 || item.stock_id == 21103
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 15 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        (item.category_name == "ابمیوه ها و موکتل ها" &&
                          item.stock_id != 21199) ||
                        item.stock_id == 2021 ||
                        item.stock_id == 21189
                    )
                    .map((items) => itemsButton(items))}
                {activeItems == 16 &&
                  searchValue.length == 0 &&
                  items
                    .filter(
                      (item) =>
                        item.stock_id == 21112 ||
                        item.stock_id == 21113 ||
                        item.stock_id == 211002 ||
                        item.stock_id == 21114 ||
                        item.stock_id == 21115
                    )
                    .map((items) => itemsButton(items))}
                {filteredData.length == 0 && searchValue.length != 0 && (
                  <p className="d-flex justify-content-center w-100">{text}</p>
                )}
              </div>
            </div>
            <div className="col-12 cafeTable col-lg-8" ref={tableRef}>
              <div className="display-none" id="printDDiv">
                <span className="bold ff my-2 d-flex">
                  شماره فاکتور : <div id="printDDivs"></div>
                </span>
              </div>
              <div className="display-none" id="printCDiv">
                <span className="row bold">
                  <span className="bold ff my-2">
                    تاریخ : {dateForWh} ساعت : {timeForWh}
                  </span>
                  <span className="bold ff my-2">
                    نام فروشنده : {seller.firstname + " " + seller.lastname}
                  </span>
                </span>
              </div>
              <table
                className="table table-bordered bordered heliumTable default"
                id="printDiv"
              >
                <thead>
                  <tr>
                    <th scope="col">ردیف</th>
                    <th scope="col">نام محصول</th>
                    <th scope="col">تعداد</th>
                    <th scope="col">قیمت واحد</th>
                    <th scope="col">قیمت کل</th>
                    <th scope="col" id="noPrint"></th>
                  </tr>
                </thead>
                <tbody>
                  {itemok.name != "" &&
                    itemok.map((items, key) => (
                      <tr>
                        <th scope="row">{key + 1}</th>
                        <td className="bold">{items.item_description}</td>
                        <td className="d-flex gap-2 ">
                          <button
                            className="btn btn-primary"
                            onClick={() => addQuantity(items.item_description)}
                            id="noPrint"
                            disabled={loading}
                          >
                            +
                          </button>
                          <TextBox
                            className="textBoxHeight bold"
                            value={items.quantity}
                            disable={loading}
                            id="noPrint"
                          />
                          <span className="display-none">{items.quantity}</span>
                          <button
                            className="btn btn-primary"
                            id="noPrint"
                            onClick={() =>
                              subQuantity(items.item_description, key)
                            }
                            disabled={loading}
                          >
                            -
                          </button>
                        </td>
                        <td className="bold">{Comma(items.unit_price)} ریال</td>
                        <td className="bold">{Comma(items.endPrice)} ریال</td>
                        <td id="noPrint">
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemoveRow(key)}
                            disabled={loading}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div
          className="cafeFooter col-12 d-flex flex-wrap align-items-center justify-content-around gap-2 px-4 py-1 bold"
          id="printBDiv"
        >
          <div className="d-flex align-items-center gap-1" id="noPrint">
            <span className="bold">تخفیف پرسنلی</span>
            <input type="checkbox" onChange={offPersonnel} id="offPersonnel" />
          </div>
          <div className="d-flex align-items-center gap-1 bordered">
            <span className="bold"> مجموع فاکتور :</span>
            <span className="bold">{Comma(endPrice)} ریال</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <span className="bold fs-print">پیجر :</span>
            <span className="bold fs-print" id="noPrint">
              <select
                className="heDropDown d-flex justify-content-between align-items-center cafeSmallInput cafeInput "
                name="pager"
                label="پیچر"
                aria-label="pager"
                disabled={itemok.length == 0 || loading}
                onChange={(e) => {
                  setPager(e.target.value);
                }}
              >
                {pagerNumber.map((pager) => {
                  return (
                    <option value={pager} key={pager}>
                      {pager}
                    </option>
                  );
                })}
              </select>
            </span>
            <span
              className="display-none bold"
              style={{ textDecoration: "underline" }}
            >
              {pager}
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-start my-2 gap-1 bold">
            <span className="bold"> توضیحات :</span>
            <div id="noPrint">
              <TextBox
                className="comment"
                disable={itemok < 1}
                id="description"
                onChange={(e) => {
                  setDescription(e.target.value);
                  itemok.description = e.target.value;
                  for (let key in itemok) {
                    itemok[key] = { ...itemok[key] };
                    itemok[key].description = e.target.value;
                  }
                }}
              />
            </div>
            <span className="display-none bold">{description}</span>
          </div>
          <button
            className="btn btn-danger clear"
            style={{ height: "45px" }}
            onClick={() => {
              setItemOk([]);
              document.getElementById("description").value = "";
              setDescription("");
            }}
            disabled={itemok.length < 1 || loading}
            id="noPrint"
          >
            پاکسازی فرم
          </button>
          <button
            className="btn btn-primary addFactorButton"
            style={{ height: "45px" }}
            onClick={() => addFactor()}
            disabled={itemok.length < 1 || loading}
            id="noPrint"
          >
            ثبت فاکتور
          </button>
          <button
            className="btn btn-success addFactorButton"
            style={{ height: "45px" }}
            onClick={() => {
              addFactorWithPrint();
            }}
            disabled={itemok.length < 1 || loading}
            id="noPrint"
          >
            ثبت با پرینت
          </button>
          <button
            className="btn btn-dark returnButton"
            style={{ height: "45px" }}
            onClick={() => {
              returnedFactor();
            }}
            disabled={itemok.length < 1 || loading}
            id="noPrint"
          >
            ثبت مرجوعی
          </button>
        </div>
      </div>
    </>
  );
}
