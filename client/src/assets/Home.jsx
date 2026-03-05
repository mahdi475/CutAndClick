import './Home.css'

const Home = () => {
  return (
    <div className="home-container">

      {/* Cards */}
      <div className="card card-left">
        <div className="card-gradient" />
        <div className="card-button">
          <span>Crew Cut</span>
        </div>
      </div>

      <div className="card card-center">
        <div className="card-gradient" />
        <div className="card-button">
          <span>Classic Haircut</span>
        </div>
      </div>

      <div className="card card-right">
        <div className="card-gradient" />
        <div className="card-button">
          <span>Buzz Cut</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="content">

        {/* Pagination */}
        <div className="pagination">
          <div className="dot active" />
          <div className="dot" />
          <div className="dot" />
        </div>

        {/* Text */}
        <div className="text-block">
          <h1>
            Booka dina <br />
            <span>Barber Appointments</span> <br />
            Effortlessly
          </h1>
          <p>Hitta erfarna Barbers i din Närhet runt hela Sverige!</p>
        </div>

        {/* Actions */}
        <div className="actions">
          <button className="primary-btn">Börja Registrera dig</button>
          <button className="icon-btn">
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1418 31.113L31.1124 14.1424M31.1124 14.1424V19.7993M31.1124 14.1424H25.4555"
                stroke="black"
                strokeWidth="2.14121"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}

export default Home
