import React, { useEffect, useState } from 'react';
import { CountryData } from '../Country';

const CountryList = () => {
    let alphabet = '', prevAlphabet = '';
    let entry = null;
    const [noResult, setNoResult] = useState(false);
    const [searchedText, setSearchText] = useState('');
    const [toShow, setShow] = useState(null);
    const inputRef = React.createRef();

    const renderCountryList = () => {
        let found = false;
        const toRender = CountryData.map((country, index) => {
            if (searchedText === '' || country.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1) {
                let alphabetWrapper = null;
                prevAlphabet = alphabet;
                alphabet = country.name[0];
                if (alphabet !== prevAlphabet) {
                    found = true;
                    alphabetWrapper = <p className="alphabet">{alphabet}</p>;
                    entry = <>{alphabetWrapper}<p className="country">{`${country.name} (${country.code})`}</p></>;
                } else {
                    entry = <p className="country">{`${country.name} (${country.code})`}</p>;
                }
            } else {
                entry = null;
            }
            return entry;
        })
        setNoResult(!found);
        setShow(toRender);
    }

    useEffect(() => {
        inputRef.current.focus();
    }, [])
    useEffect(() => {
        renderCountryList();
    }, [searchedText]);

    return (
        <div className='wrapper'>
            <div className="input_field">
                <input ref={inputRef} type='text' placeholder='Type to search something...' onChange={e => setSearchText(e.target.value)} />
            </div>
            {
                noResult && <div className='no_result'>Oops! No result found</div>
            }
            {
                toShow
            }
        </div>
    )
}

export default CountryList;