import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash.debounce';

function App() {

  const [selectedAddress, setSelectedAddress] = useState(null)

  console.log(selectedAddress);

  const debouncedLoadOptions = useRef(
    debounce(async (inputValue, callback) => {
      if (!inputValue || inputValue.length < 5) return
      try {
        const response = await axios.get(`https://geocode.search.hereapi.com/v1/geocode`, {
          params: {
            q: inputValue,
            apiKey: import.meta.env.VITE_APIKEY,
          },
        });

        const results = response.data.items.map(item => ({
          label: item?.address?.label,
          value: {
            id: item?.id,
            address: item?.address,
            position: item?.position,
          },
        }));

        callback(results);
      } catch (error) {
        console.error('Error fetching data:', error);
        callback([]);
      }
    }, 1000)
  ).current;

  // useCallback with an empty dependency array to ensure stability
  const loadOptions = useCallback((inputValue, callback) => {
    debouncedLoadOptions(inputValue, callback);
  }, [debouncedLoadOptions]); // Empty array ensures this is only created once on mount


  return (
    <div className="bg-slate-100 w-full min-h-screen" >
      <div className="w-full max-w-screen-lg mx-auto py-24 px-4 md:px-10" >
        <h1 className="text-5xl font-semibold" >Search Address</h1>
        <div className='mt-6' >
          <AsyncSelect
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions
            placeholder="Search for a location..."
            onChange={(address) => setSelectedAddress(address)}
          />
        </div>
        {selectedAddress && <div className='bg-white mt-6 p-4 flex flex-col gap-3' >
          <p><span className='font-medium text-slate-700' >Address:</span> {selectedAddress?.value?.address?.label}</p>
          <p><span className='font-medium text-slate-700' >Country:</span> {selectedAddress?.value?.address?.countryName}</p>
          <p><span className='font-medium text-slate-700' >State:</span> {selectedAddress?.value?.address?.state}</p>
          <p><span className='font-medium text-slate-700' >City:</span> {selectedAddress?.value?.address?.city}</p>
          <p><span className='font-medium text-slate-700' >Postal Code:</span> {selectedAddress?.value?.address?.postalCode}</p>
          <p><span className='font-medium text-slate-700' >Street:</span> {selectedAddress?.value?.address?.street}</p>
          <p><span className='font-medium text-slate-700' >Lat:</span> {selectedAddress?.value?.position?.lat}</p>
          <p><span className='font-medium text-slate-700' >Lng:</span> {selectedAddress?.value?.position?.lng}</p>
        </div>}
      </div>
    </div>
  )
}

export default App
