import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState; // Initializing initial 'value' with initialState or with the stored value from localStorage.
  }); // This useState hook reads the state and sets the state.

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value)); // Updating the localStorage with the new [watched] array from App().
    },
    [key, value]
  ); // This useEffect hook updates the state.

  return [value, setValue]; //Returning 'value' as 'watched' array and 'setValue' as 'setWatched' setter function.
}
