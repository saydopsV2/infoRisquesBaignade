import React from 'react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
    return (
        <div className="navbar bg-yellow-300 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="black"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-red-800 rounded-box z-10 mt-3 w-52 p-2 shadow text-slate-50 text-xl font-bold">
                        <li><Link to="/">Accueil</Link></li>
                        <li><Link to="/lette-blanche">La lette Blanche</Link></li>
                        <li><Link to="/biscarrosse">Biscarosse</Link></li>
                    </ul>
                </div>
            </div>
            <div className="navbar-center flex items-center gap-0 sm:gap-2">
                <img src={`${import.meta.env.BASE_URL}img/finL.png`} alt="" className='w-10 sm:w-20'/>
                <Link to="/" className="btn btn-ghost text-base sm:text-xl px-1 sm:px-3 text-slate-800 hover:text-white hover:bg-red-800 hover:border-red-400">Info Risques Baignade</Link>
                <img src={`${import.meta.env.BASE_URL}img/finR.png`} alt="" className='w-10 sm:w-20'/>
            </div>
            <div className="navbar-end">
                <Link to="/" className="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="black">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default NavBar;