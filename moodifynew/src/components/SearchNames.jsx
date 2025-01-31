import React, { useState } from 'react';
import { handleFormSubmit } from '../api.jsx';
import '../style.css';

import NavBar from './NavBar.jsx';
import SearchForm from './SearchForm.jsx';
import ResultsList from './ResultList.jsx';

function SearchNames() {
    const [names, setNames] = useState([]);
    const [query, setQuery] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await handleFormSubmit(query);
        if (result.error) {
            console.error(result.error);
        } else {
            if (Array.isArray(result.names)) {
                setNames(result.names);
            } else {
                console.error("Received unexpected data format from server");
            }
        }
        setQuery('');
    };
    return (
        <div>
            <NavBar />
            <div className="container">
                <SearchForm 
                    query={query} 
                    onQueryChange={e => setQuery(e.target.value)}
                    onSubmit={handleSubmit}
                />
                <ResultsList names={names} />
            </div>
        </div>
    );
}

export default SearchNames;