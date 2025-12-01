import { useState, useEffect } from "react";
import moment from "moment-jalaali";
moment.loadPersian({ dialect: "persian-modern" }); // اضافه کردن این خط

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [totalMissing, setTotalMissing] = useState(0);
  const [totalSnapBonus, setTotalSnapBonus] = useState(0);

let m = moment();

if (m.jDate() <= 5) {
  m = m.subtract(1, "jMonth");
}

const year  = m.format("jYYYY");
const month = m.format("jMM");



  // ✅ بارگذاری داده‌ها از LocalStorage هنگام mount اولیه
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("attendanceData"));
    if (storedData && storedData.length > 0) {
      setAttendanceData(storedData);
    } else {
      const daysInMonthCount = moment.jDaysInMonth(year, month - 1);
     const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => {
  const date = moment(`${year}/${month}/${i + 1}`, "jYYYY/jMM/jDD");
  return {
    dayNumber: i + 1,
    date: date.format("jYYYY/jMM/jDD"),
    dayName: date.format("dddd"),
    entryTime: "09:45",
    exitTime: "17:45",
    shiftType: "morning",
    isLeave: false,
  };
});

      setAttendanceData(daysInMonth);
      localStorage.setItem("attendanceData", JSON.stringify(daysInMonth));
    }
  }, []);

  // ✅ ذخیره تغییرات در LocalStorage هنگام تغییر `attendanceData`
  useEffect(() => {
    if (attendanceData.length > 0) {
      localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
    }
    calculateTotals();
  }, [attendanceData]);

  // ✅ ذخیره تغییرات ورودی کاربر
  const handleInputChange = (index, field, value) => {
    const newData = [...attendanceData];
    newData[index][field] = value;

    // إذا تم تحديد مرخصي، مسح ساعات العمل
    if (field === "isLeave" && value === true) {
      newData[index].entryTime = "";
      newData[index].exitTime = "";
    }

    // تنظیم خودکار ساعت‌ها بر اساس نوع شیفت
    if (field === "shiftType") {
      if (value === "morning") {
        newData[index].entryTime = "09:45";
        newData[index].exitTime = "17:45";
      } else if (value === "morning11") {
        newData[index].entryTime = "09:45";
        newData[index].exitTime = "20:45";
      } else if (value === "evening") {
        newData[index].entryTime = "15:00";
        newData[index].exitTime = "23:00";
      } else if (value === "evening11") {
        // Use the current day's date from newData
        const currentDay = moment(newData[index].date, "jYYYY/jMM/jDD").day();
        // شنبه تا سه‌شنبه
        if ([0, 1, 2, 3].includes(currentDay)) {
          newData[index].entryTime = "12:00";
          newData[index].exitTime = "23:00";
        }
        // چهارشنبه تا جمعه
        else {
          newData[index].entryTime = "12:30";
          newData[index].exitTime = "23:30";
        }
      } else if (value === "evening2") {
        newData[index].entryTime = "15:30";
        newData[index].exitTime = "23:30";
      } else if (value === "evening211") {
        newData[index].entryTime = "12:30";
        newData[index].exitTime = "23:30";
      }
    }

    setAttendanceData(newData);
  };

  // ✅ محاسبه اضافه‌کاری، کسری کار، و پاداش اسنپ
  const calculateTotals = () => {
    let overtimeSum = 0;
    let missingSum = 0;
    let snapBonusSum = 0;

    attendanceData.forEach((day) => {
      const entryTime = day.entryTime ? moment(day.entryTime, "HH:mm") : null;
      const exitTime = day.exitTime ? moment(day.exitTime, "HH:mm") : null;
      if (!entryTime || !exitTime) return;

      const workMinutes = exitTime.diff(entryTime, "minutes");
      let extraMinutes = 0;
      let missingMinutes = 0;
      const snapBonus = exitTime.hour() >= 22 ? 150000 : 0;

      // برای شیفت‌های 11 ساعته
      if (["morning11", "evening11", "evening211"].includes(day.shiftType)) {
        // فقط اگر بیشتر از 11 ساعت کار شده باشد
        if (workMinutes > 660) {
          // 11 ساعت = 660 دقیقه
          extraMinutes = workMinutes - 660;
        }
        // کسری کار برای شیفت‌های 11 ساعته محاسبه نمی‌شود
        snapBonusSum += snapBonus;
        extraMinutes = workMinutes - 660;
        overtimeSum += extraMinutes * 1333;
        return;
      }

      // محاسبات برای شیفت‌های 8 ساعته
      let requiredMinutes;
      let requiredEntryTime, requiredExitTime;

      if (day.shiftType === "morning") {
        requiredEntryTime = moment("09:45", "HH:mm");
        requiredExitTime = moment("17:45", "HH:mm");
        requiredMinutes = 480;
      } else if (day.shiftType === "evening") {
        requiredEntryTime = moment("15:00", "HH:mm");
        requiredExitTime = moment("23:00", "HH:mm");
        requiredMinutes = 480;
      } else if (day.shiftType === "evening2") {
        requiredEntryTime = moment("15:30", "HH:mm");
        requiredExitTime = moment("23:30", "HH:mm");
        requiredMinutes = 480;
      }

      missingMinutes = day.isLeave
        ? 0
        : entryTime.isAfter(requiredEntryTime)
        ? entryTime.diff(requiredEntryTime, "minutes")
        : 0;
      missingMinutes += day.isLeave
        ? 0
        : exitTime.isBefore(requiredExitTime)
        ? requiredExitTime.diff(exitTime, "minutes")
        : 0;

      extraMinutes = day.isLeave
        ? workMinutes
        : workMinutes > requiredMinutes
        ? workMinutes - requiredMinutes
        : 0;

      overtimeSum += extraMinutes * (80000 / 60); // دقیقه‌ای 1333.33 تومان (دقیقاً 80 هزار تومان در ساعت)
      missingSum += missingMinutes * 3000;
      snapBonusSum += snapBonus;
    });

    setTotalOvertime(overtimeSum);
    setTotalMissing(missingSum);
    setTotalSnapBonus(snapBonusSum);
  };

  const autoSetShiftTimes = (shiftType) => {
    switch (shiftType) {
      case "morning":
        return { entry: "09:45", exit: "17:45" };
      case "morning11":
        return { entry: "09:45", exit: "20:45" };
      // ... سایر شیفت‌ها
      default:
        return { entry: "09:45", exit: "17:45" };
    }
  };

  return (
    <div className="container">
      <h2 className="d-flex justify-content-center py-2">
        جدول حضور و غیاب {year +"/" + month}
      </h2>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (window.confirm("کل صفحه پاک میشود !!")) {
              localStorage.clear("attendanceData");
              window.location.reload();
            } else return;
          }}
        >
          پاکسازی
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              isLeave: true,
              entryTime: "",
              exitTime: "",
            }));
            setAttendanceData(newData);
          }}
        >
          علامت‌گذاری همه
        </button>

        <button
          type="button"
          onClick={() => {
            const daysToMark = prompt(
              "لطفاً روزهای مورد نظر را با کاما جدا کنید (مثال: 1,2,5,10)"
            );
            if (daysToMark) {
              const daysArray = daysToMark
                .split(",")
                .map((day) => parseInt(day.trim()));
              const newData = attendanceData.map((day) => {
                if (daysArray.includes(day.dayNumber)) {
                  return {
                    ...day,
                    isLeave: true,
                    entryTime: "",
                    exitTime: "",
                  };
                }
                return day;
              });
              setAttendanceData(newData);
            }
          }}
        >
          علامت‌گذاری روزهای خاص
        </button>

        <button
          type="button"
          onClick={() => {
            const daysMapping = {
              شنبه: 6, // Saturday
              یکشنبه: 0, // Sunday
              دوشنبه: 1, // Monday
              "سه شنبه": 2, // Tuesday
              چهارشنبه: 3, // Wednesday
              پنجشنبه: 4, // Thursday
              جمعه: 5, // Friday
            };

            const selectedDay = prompt(
              "لطفاً نام روز هفته را وارد کنید (مثال: سه شنبه)"
            );
            if (selectedDay && daysMapping[selectedDay] !== undefined) {
              const newData = [...attendanceData].map((day) => {
                if (
                  moment(day.date, "jYYYY/jMM/jDD").day() ===
                  daysMapping[selectedDay]
                ) {
                  return {
                    ...day,
                    isLeave: true,
                    entryTime: "",
                    exitTime: "",
                  };
                }
                return day;
              });
              setAttendanceData(newData);
            } else if (selectedDay) {
              alert("روز وارد شده معتبر نیست");
            }
          }}
        >
          علامت‌گذاری روزهای هفته
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              isLeave: false,
              entryTime:
                day.shiftType === "morning"
                  ? "09:45"
                  : day.shiftType === "evening"
                  ? "15:00"
                  : "15:30",
              exitTime:
                day.shiftType === "morning"
                  ? "17:45"
                  : day.shiftType === "evening"
                  ? "23:00"
                  : "23:30",
            }));
            setAttendanceData(newData);
          }}
        >
          حذف مرخصی از همه
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              shiftType: "morning",
              entryTime: "09:45",
              exitTime: "17:45",
            }));
            setAttendanceData(newData);
          }}
        >
          صبح 8 ساعته
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              shiftType: "evening",
              entryTime: "15:00",
              exitTime: "23:00",
            }));
            setAttendanceData(newData);
          }}
        >
          عصر 8 ساعته
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              shiftType: "morning11",
              entryTime: "09:45",
              exitTime: "20:45",
            }));
            setAttendanceData(newData);
          }}
        >
          صبح 11 ساعته
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              shiftType: "evening11",
              entryTime: "12:00",
              exitTime: "23:00",
            }));
            setAttendanceData(newData);
          }}
        >
          عصر 11 ساعته
        </button>

        <button
          type="button"
          onClick={() => {
            const newData = attendanceData.map((day) => ({
              ...day,
              shiftType: "evening211",
              entryTime: "12:30",
              exitTime: "23:30",
            }));
            setAttendanceData(newData);
          }}
        >
          عصر 11 ساعته - 2
        </button>
      </div>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>تاریخ</th>
            <th>روز هفته</th>
            <th>شیفت</th>
            <th>مرخصی</th>
            <th>ورود</th>
            <th>خروج</th>
            <th>اضافه‌کاری</th>
            <th>کسری کار</th>
            <th>اسنپ</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((day, index) => {
            const entryTime = day.entryTime
              ? moment(day.entryTime, "HH:mm")
              : null;
            const exitTime = day.exitTime
              ? moment(day.exitTime, "HH:mm")
              : null;
            const workMinutes =
              exitTime && entryTime ? exitTime.diff(entryTime, "minutes") : 0;

            let extraMinutes = 0;
            let missingMinutes = 0;
            let snapBonusValue = exitTime?.hour() >= 22 ? 150000 : 0;

            if (
              ["morning11", "evening11", "evening211"].includes(day.shiftType)
            ) {
              // محاسبات برای شیفت‌های 11 ساعته
              const requiredMinutes = 660; // 11 ساعت
              if (workMinutes < requiredMinutes) {
                missingMinutes = requiredMinutes - workMinutes;
              } else if (workMinutes > requiredMinutes) {
                extraMinutes = workMinutes - requiredMinutes;
              }
            } else {
              // محاسبات برای شیفت‌های 8 ساعته
              let requiredMinutes;
              let requiredEntryTime, requiredExitTime;

              if (day.shiftType === "morning") {
                requiredEntryTime = moment("09:45", "HH:mm");
                requiredExitTime = moment("17:45", "HH:mm");
                requiredMinutes = 480;
              } else if (day.shiftType === "evening") {
                requiredEntryTime = moment("15:00", "HH:mm");
                requiredExitTime = moment("23:00", "HH:mm");
                requiredMinutes = 480;
              } else {
                requiredEntryTime = moment("15:30", "HH:mm");
                requiredExitTime = moment("23:30", "HH:mm");
                requiredMinutes = 480;
              }

              missingMinutes = day.isLeave
                ? 0
                : entryTime?.isAfter(requiredEntryTime)
                ? entryTime.diff(requiredEntryTime, "minutes")
                : 0;
              missingMinutes += day.isLeave
                ? 0
                : exitTime?.isBefore(requiredExitTime)
                ? requiredExitTime.diff(exitTime, "minutes")
                : 0;

              extraMinutes = day.isLeave
                ? workMinutes
                : workMinutes > requiredMinutes
                ? workMinutes - requiredMinutes
                : 0;
            }
            const snapBonus = exitTime?.hour() >= 22 ? 150000 : 0;
            // Remove this line: const daysName = date.format(day.dayName)

            return (
              <tr
                key={day.dayNumber}
                className={day.isLeave ? "bg-success text-white" : ""}
              >
                <td>{day.date}</td>
                <td>{day.dayName}</td> {/* Use day.dayName directly */}
                <td>
                  <select
                    value={day.shiftType}
                    onChange={(e) =>
                      handleInputChange(index, "shiftType", e.target.value)
                    }
                  >
                    <option value="morning">صبح (8 ساعته)</option>
                    <option value="evening">عصر (8 ساعته)</option>
                    <option value="evening2">عصر 2 (8 ساعته)</option>
                    <option value="morning11">صبح (11 ساعته)</option>
                    <option value="evening11">عصر (11 ساعته)</option>
                    <option value="evening211">عصر 2 (11 ساعته)</option>
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={day.isLeave}
                    onChange={(e) =>
                      handleInputChange(index, "isLeave", e.target.checked)
                    }
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={day.entryTime}
                    onChange={(e) =>
                      handleInputChange(index, "entryTime", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={day.exitTime}
                    onChange={(e) =>
                      handleInputChange(index, "exitTime", e.target.value)
                    }
                  />
                </td>
                <td>{Math.round(extraMinutes * (80000 / 60))} تومان</td>
                <td>{missingMinutes * 3000} تومان</td>
                <td>{snapBonus} تومان</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        className="summary-container"
        style={{
          position: "sticky",
          bottom: 0,
          background: "white",
          padding: "10px",
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>جمع‌بندی ماهانه:</h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <span>💰 {totalOvertime.toLocaleString()} تومان</span>
          <span>🔻 {totalMissing.toLocaleString()} تومان</span>
          <span>🚕 {totalSnapBonus.toLocaleString()} تومان</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
