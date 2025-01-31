import React,{useState} from 'react';
import {handleFormSubmit} from '../api';

import SpotifyLogo9 from '../spotify-9.png';

import '../style.css';

import Navbar from '../components/NavBar.jsx';
import SearchForm from '../components/SearchForm.jsx';
import ResultsList from '../components/ResultList.jsx';

function SearchPage()
{
    const [songs,setSongs]=useState([]);
    const [errors, setErrors] = useState([]);
    const [query, setQuery] = useState('');
    const [animationState, setAnimationState] = useState('off-screen');

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setAnimationState('entering-spinning');

        if(Array.isArray(ResultsList.songs)){
            setSongs(ResultsList.songs);
            setAnimationState('exiting');
            setTimeout(()=>setAnimationState('idle',1000));
        }
        else
        {
            console.error("Received unexpected songs data format from server");
        }


        if (Array.isArray(result.errors)) {
            setErrors(result.errors);
        } else {
            console.error("Received unexpected errors data format from server");
        }
    };


    const modifiedSongs = songs.map((song, index) => ({
        ...song,
        frontend_id: index
    }));


    const songIds = modifiedSongs.map(song => song.id);


    return (

        <div className='no-extend-wrapper'>
            <Navbar songIds={songIds}/>
            <div className='logo-wrapper'>
            <img 
                src={SpotifyLogo9}
                className={`logo-fixed ${
                    animationState === 'entering-spinning'
                        ? 'logo-entering-spinning'
                        : animationState === 'exiting'
                        ? 'logo-exiting'
                        : 'logo-idle'
                }`} 
                alt="Spotify Logo"
            />
            </div>
            <div className="container">
                <SearchForm 
                    query={query} 
                    onQueryChange={e => setQuery(e.target.value)}
                    onSubmit={handleSubmit}
                />
                <ResultsList songs={modifiedSongs} errors={errors} />
            </div>
        </div>

    )   
}

export default SearchPage;