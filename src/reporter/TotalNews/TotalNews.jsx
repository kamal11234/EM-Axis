import { useMemo, useState } from "react";



import "./totalNews.css";


const initialNews = [
  {
    id: "N001",
    title: "City to get New Metro Line Nesxt Year",
    format: "AV",
    date: "2025-08-12",
    displayDate: "12-08-2025",
    time: "10:30 AM",
    location: "Pune",
    status: "Published",
  },
  {
    id: "N002",
    title: "Traffic diversions in city due to metro work",
    format: "AVB",
    date: "2025-08-10",
    displayDate: "10-08-2025",
    time: "08:45 AM",
    location: "Mumbai",
    status: "Approved",
  },
  {
    id: "N003",
    title: "Local Festival Sale",
    format: "One to One",
    date: "2025-08-08",
    displayDate: "08-08-2025",
    time: "10:30 PM",
    location: "Maharashtra",
    status: "Pending",
  },
  {
    id: "N004",
    title: "Traffic Rules Awareness",
    format: "PKG",
    date: "2025-08-07",
    displayDate: "07-08-2025",
    time: "12:36 PM",
    location: "Delhi",
    status: "Rejected",
  },
  {
    id: "N005",
    title: "New Highway project to boost connectivity",
    format: "WKT Tiktak",
    date: "2025-08-11",
    displayDate: "11-08-2025",
    time: "04:15 PM",
    location: "Lonavala",
    status: "Approved",
  },
  {
    id: "N006",
    title: "New education policy brings major changes",
    format: "WKT",
    date: "2025-08-08",
    displayDate: "08-08-2025",
    time: "01:20 PM",
    location: "Sawantwadi",
    status: "Approved",
  },
];


const formats = [
  "All",
  "AV",
  "AVB",
  "PKG",
  "WKT",
  "WKT Tiktak",
  "One to One",
];


const statuses = [
  "All",
  "Published",
  "Approved",
  "Pending",
  "Rejected",
];


function TotalNews() {

  const [news, setNews] = useState(initialNews);

  const [search, setSearch] = useState("");

  const [format, setFormat] = useState("All");

  const [status, setStatus] = useState("All");

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedNews, setSelectedNews] = useState(null);

  const [modalType, setModalType] = useState("");


  /* ================================
     FILTER
  ================================= */

  const filteredNews = useMemo(() => {

    const searchText =
      search.trim().toLowerCase();

    return news.filter((item) => {

      const searchMatch =
        !searchText ||
        item.title
          .toLowerCase()
          .includes(searchText);

      const formatMatch =
        format === "All" ||
        item.format === format;

      const statusMatch =
        status === "All" ||
        item.status === status;

      const dateMatch =
        !selectedDate ||
        item.date === selectedDate;

      return (
        searchMatch &&
        formatMatch &&
        statusMatch &&
        dateMatch
      );
    });

  }, [
    news,
    search,
    format,
    status,
    selectedDate,
  ]);


  /* ================================
     VIEW
  ================================= */

  const handleView = (item) => {

    setSelectedNews(item);

    setModalType("view");

  };


  /* ================================
     EDIT
  ================================= */

  const handleEdit = (item) => {

    setSelectedNews({
      ...item,
    });

    setModalType("edit");

  };


  /* ================================
     CLOSE MODAL
  ================================= */

  const closeModal = () => {

    setSelectedNews(null);

    setModalType("");

  };


  /* ================================
     SAVE EDIT
  ================================= */

  const saveEdit = () => {

    if (!selectedNews) {
      return;
    }

    setNews((currentNews) =>

      currentNews.map((item) =>

        item.id === selectedNews.id
          ? selectedNews
          : item

      )

    );

    closeModal();

  };


  /* ================================
     DELETE
  ================================= */

  const handleDelete = (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this news?"
      );

    if (!confirmDelete) {
      return;
    }

    setNews((currentNews) =>

      currentNews.filter(
        (item) => item.id !== id
      )

    );

  };


  return (

    <div className="total-news-page">


      {/* =====================================
          EXISTING NAVBAR
      ====================================== */}

     


      {/* =====================================
          PAGE LAYOUT
      ====================================== */}

      <div className="total-news-layout">


        {/* =====================================
            EXISTING SIDEBAR
        ====================================== */}

      


        {/* =====================================
            MAIN CONTENT
        ====================================== */}

        <main className="total-news-main">


          {/* =====================================
              TITLE
          ====================================== */}

          <section className="total-title-row">

            <div className="total-title-left">


              <div className="all-icon">
                ALL
              </div>


              <h1>
                Total News
              </h1>


              <span className="news-count">
                102
              </span>


            </div>

          </section>


          {/* =====================================
              SEARCH
          ====================================== */}

          <section className="filters">

  <div className="filter-fields">

    {/* SEARCH */}
    <label className="filter-item search-field">
      <span>Search by News Slug</span>

      <div className="search-input">
        <span>⌕</span>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by News Slug"
        />
      </div>
    </label>


    {/* NEWS FORMAT */}
    <label className="filter-item">
      <span>News Format</span>

      <select
        value={format}
        onChange={(event) =>
          setFormat(event.target.value)
        }
      >
        {formats.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>
    </label>


    {/* STATUS */}
    <label className="filter-item">
      <span>Status</span>

      <select
        value={status}
        onChange={(event) =>
          setStatus(event.target.value)
        }
      >
        {statuses.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>
    </label>


    {/* DATE */}
    <label className="filter-item">
      <span>Date</span>

      <div className="single-date">
        <input
          type="date"
          value={selectedDate}
          onChange={(event) =>
            setSelectedDate(event.target.value)
          }
        />
      </div>
    </label>

  </div>

</section>


          {/* =====================================
              TABLE
          ====================================== */}

          <section className="news-table-wrapper">


            <table className="news-table">


              <thead>

                <tr>

                  <th>
                    News ID
                  </th>

                  <th>
                    News Slug
                  </th>

                  <th>
                    Format
                  </th>

                  <th>
                    Created Date
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>


                {filteredNews.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="no-results"
                    >
                      No news found.
                    </td>

                  </tr>

                ) : (


                  filteredNews.map((item) => (


                    <tr key={item.id}>


                      {/* NEWS ID */}

                      <td>
                        {item.id}
                      </td>


                      {/* NEWS SLUG */}

                      <td>

                        <div className="news-slug">


                          <div className="thumbnail">
                            {item.title
                              .charAt(0)
                              .toUpperCase()}
                          </div>


                          <strong>
                            {item.title}
                          </strong>


                        </div>

                      </td>


                      {/* FORMAT */}

                      <td>

                        <strong>
                          {item.format}
                        </strong>

                      </td>


                      {/* DATE */}

                      <td>

                        <div className="created-date">

                          <strong>
                            {item.displayDate}
                          </strong>

                          <small>
                            {item.time}
                          </small>

                        </div>

                      </td>


                      {/* LOCATION */}

                      <td>
                        {item.location}
                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            `status-badge status-${item.status.toLowerCase()}`
                          }
                        >
                          {item.status}
                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="actions">


                          <button
                            type="button"
                            className="view"
                            title="View"
                            onClick={() =>
                              handleView(item)
                            }
                          >
                            ◉
                          </button>


                          <button
                            type="button"
                            className="edit"
                            title="Edit"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            ✎
                          </button>


                          <button
                            type="button"
                            className="delete"
                            title="Delete"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                          >
                            ▥
                          </button>


                        </div>

                      </td>


                    </tr>

                  ))

                )}


              </tbody>


            </table>


          </section>


        </main>


      </div>


      {/* =====================================
          MODAL
      ====================================== */}

      {modalType && selectedNews && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >


          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="modal-header">

              <h2>

                {modalType === "view"
                  ? "News Details"
                  : "Edit News"}

              </h2>


              <button
                type="button"
                onClick={closeModal}
              >
                ×
              </button>


            </div>


            {/* =================================
                VIEW
            ================================== */}

            {modalType === "view" && (

              <div className="view-news">


                <h3>
                  {selectedNews.title}
                </h3>


                <p>
                  <b>
                    News ID:
                  </b>{" "}
                  {selectedNews.id}
                </p>


                <p>
                  <b>
                    Format:
                  </b>{" "}
                  {selectedNews.format}
                </p>


                <p>
                  <b>
                    Created Date:
                  </b>{" "}
                  {selectedNews.displayDate}
                </p>


                <p>
                  <b>
                    Time:
                  </b>{" "}
                  {selectedNews.time}
                </p>


                <p>
                  <b>
                    Location:
                  </b>{" "}
                  {selectedNews.location}
                </p>


                <p>
                  <b>
                    Status:
                  </b>{" "}
                  {selectedNews.status}
                </p>


              </div>

            )}


            {/* =================================
                EDIT
            ================================== */}

            {modalType === "edit" && (

              <div className="edit-news">


                <label>

                  Headline

                  <input
                    type="text"
                    value={selectedNews.title}
                    onChange={(event) =>
                      setSelectedNews({
                        ...selectedNews,
                        title:
                          event.target.value,
                      })
                    }
                  />

                </label>


                <label>

                  Format

                  <select
                    value={selectedNews.format}
                    onChange={(event) =>
                      setSelectedNews({
                        ...selectedNews,
                        format:
                          event.target.value,
                      })
                    }
                  >

                    {formats
                      .filter(
                        (item) =>
                          item !== "All"
                      )
                      .map((item) => (

                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>

                      ))}

                  </select>

                </label>


                <label>

                  Status

                  <select
                    value={selectedNews.status}
                    onChange={(event) =>
                      setSelectedNews({
                        ...selectedNews,
                        status:
                          event.target.value,
                      })
                    }
                  >

                    {statuses
                      .filter(
                        (item) =>
                          item !== "All"
                      )
                      .map((item) => (

                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>

                      ))}

                  </select>

                </label>


                <label>

                  Location

                  <input
                    type="text"
                    value={
                      selectedNews.location
                    }
                    onChange={(event) =>
                      setSelectedNews({
                        ...selectedNews,
                        location:
                          event.target.value,
                      })
                    }
                  />

                </label>


                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="save"
                    onClick={saveEdit}
                  >
                    Save Changes
                  </button>

                </div>


              </div>

            )}


          </div>


        </div>

      )}


    </div>

  );
}


export default TotalNews;