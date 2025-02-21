import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import axios from "axios";

const BASE_URL = "https://192.168.1.6:1234";
const CitiesContext = createContext();

const initialCityState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(citiesState, action) {
  switch (action.type) {
    case "isLoading":
      return { ...citiesState, isLoading: true };
    case "cities/isLoaded":
      return {
        ...citiesState,
        isLoading: false,
        cities: action.payload || [],
      };
    case "city/isLoaded":
      return {
        ...citiesState,
        isLoading: false,
        currentCity: action.payload,
      };
    case "city/isAdded":
      return {
        ...citiesState,
        isLoading: false,
        cities: [...citiesState.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/isDeleted":
      return {
        ...citiesState,
        isLoading: false,
        cities: citiesState.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return { ...citiesState, isLoading: false, rejected: action.payload };
    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialCityState
  );

  useEffect(() => {
    const fetchCities = async () => {
      dispatch({ type: "isLoading" });
      try {
        const rsp = await axios.get(`${BASE_URL}/cities`);
        dispatch({ type: "cities/isLoaded", payload: rsp.data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "Something went wrong while loading cities...",
        });
      }
    };
    fetchCities();
  }, []);

  const getCity = useCallback(
    (id) => {
      if (id === currentCity.id) return;
      const fetchCities = async () => {
        dispatch({ type: "isLoading" });
        try {
          const rsp = await axios.get(`${BASE_URL}/cities/${id}`);
          dispatch({ type: "city/isLoaded", payload: rsp.data });
        } catch {
          dispatch({
            type: "rejected",
            payload: "Something went wrong while loading the city...",
          });
        }
      };
      fetchCities();
    },
    [currentCity.id]
  );

  const addCity = (newCity) => {
    const updatedCityList = async () => {
      dispatch({ type: "isLoading" });
      try {
        const req = await axios.post(
          `${BASE_URL}/cities`,
          JSON.stringify(newCity)
        );
        dispatch({ type: "city/isAdded", payload: req.data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "Something went wrong while adding the city...",
        });
      }
    };
    updatedCityList();
  };

  const deleteCity = (id) => {
    const updatedCityList = async () => {
      dispatch({ type: "isLoading" });
      try {
        await axios.delete(`${BASE_URL}/cities/${id}`);
        dispatch({ type: "city/isDeleted", payload: id });
      } catch {
        dispatch({
          type: "rejected",
          payload: "Something went wrong while deleting the city...",
        });
      }
    };
    updatedCityList();
  };

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        addCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCitiesContext() {
  const values = useContext(CitiesContext);
  if (values === undefined)
    throw new Error("Context used out of Provider Scope");
  return values;
}

export { CitiesProvider, useCitiesContext };
