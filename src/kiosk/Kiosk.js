import { useState, useRef, useEffect } from "react";
import Comma from "../utility/Comma";

const Kiosk = () => {
  const [rfid, setRfid] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null); // ذخیره زمان باقی‌مانده
  const inputRef = useRef(null);
  let rfidBuffer = "";

  const rfidMap = {
    1358533652: "777",
    1: "666",
    4144142868: "123",
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const scannedRfid = rfidBuffer.trim();
      if (scannedRfid.length > 0) {
        rfidBuffer = "";
        const actualRfid = rfidMap[scannedRfid] || scannedRfid;

        if (
          data &&
          data.players.some(
            (player) => String(player.rfid) === String(actualRfid)
          )
        ) {
          return;
        }

        setLoading(true);

        setTimeout(() => {
          const mockData = {
            groups: [
              {
                balance: 120000,
                players: [
                  {
                    id: 1,
                    rfid: "444",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 2,
                    rfid: "555",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 3,
                    rfid: "666",
                    halls: [{ name: "کودکان", timeUsed: 10, cost: 245000 }],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 5,
                    rfid: "144",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                  {
                    id: 4,
                    rfid: "777",
                    halls: [
                      { name: "جاذبه", timeUsed: 18, cost: 395000 },
                      { name: "کهکشان", timeUsed: 12, cost: 250000 },
                    ],
                  },
                ],
              },
            ],
          };

          const groupData = mockData.groups.find((group) =>
            group.players.some(
              (player) => String(player.rfid) === String(actualRfid)
            )
          );

          if (groupData) {
            setData(groupData);
            // محاسبه زمان باقی‌مانده
            const totalTime = groupData.balance / 12000;
            setRemainingTime(totalTime.toFixed(2));
          } else {
            setData({
              players: [],
              balance: 0,
              message: "دستبند هنوز به هیچ سالنی اختصاص داده نشده است.",
            });
            setRemainingTime(null); // در صورت عدم وجود داده، زمان باقی‌مانده را پاک کنیم
          }

          setLoading(false);
        }, 1000);
      }
    } else {
      rfidBuffer += event.key;
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white p-4">
      <input
        type="text"
        ref={inputRef}
        className="position-absolute opacity-0"
        autoFocus
        onKeyDown={handleKeyPress}
      />
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-info mb-3" role="status"></div>
          <p className="fs-4">در حال بارگیری...</p>
        </div>
      ) : (
        <div className="container bg-secondary p-4 rounded shadow text-center">
          {data ? (
            <>
              {data.message && (
                <p className="fs-5 text-warning">{data.message}</p>
              )}
              <h2 className="text-black mb-4">
                💰 مانده گروهی: {Comma(data.balance)} تومان
              </h2>
              {/* زمان باقی‌مانده زیر مانده گروهی */}
              {remainingTime && (
                <p className="fs-5 text-warning">
                  ⏳ زمان باقی‌مانده برای بازی یک نفر : {remainingTime} دقیقه
                </p>
              )}
              <div
                className={`row ${
                  data.players.length === 1
                    ? "d-flex justify-content-center"
                    : "row-cols-1 row-cols-md-3 g-4"
                }`}
              >
                {data.players.map((player) => {
                  const totalCost = player.halls.reduce(
                    (acc, hall) => acc + hall.cost,
                    0
                  );
                  return (
                    <div
                      key={player.id}
                      className="col d-flex align-items-stretch"
                    >
                      <div className="card bg-dark text-white border border-light shadow-lg p-3 flex-fill">
                        <h5 className="card-title text-center text-info mb-3">
                          🆔 دستبند: {player.rfid}
                        </h5>
                        {player.halls.length > 1 ? (
                          <div className="d-flex justify-content-between">
                            {player.halls.map((hall, index) => (
                              <div
                                key={index}
                                className="col bg-secondary text-white p-3 rounded mx-1"
                              >
                                <strong>🏟️ {hall.name}</strong>
                                <p>
                                  ⏳ زمان استفاده شده : {hall.timeUsed} دقیقه
                                </p>
                                <p>💰 هزینه مصرفی : {Comma(hall.cost)} تومان</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center bg-secondary text-white p-3 rounded">
                            <strong>🏟️ {player.halls[0].name}</strong>
                            <p>
                              ⏳ زمان استفاده شده : {player.halls[0].timeUsed}{" "}
                              دقیقه
                            </p>
                            <p>
                              💰 هزینه مصرفی : {Comma(player.halls[0].cost)}{" "}
                              تومان
                            </p>
                          </div>
                        )}
                        <hr className="bg-light my-3" />
                        <p className="text-center fs-5">
                          <strong>💰 مجموع هزینه : </strong> {Comma(totalCost)}{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="fs-5 text-light">🚀 لطفاً دستبند را اسکن کنید...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Kiosk;
