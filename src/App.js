import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import axios from "axios";
import { useLocalStorageState } from "./useLocalStorageState";
import useKey from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "92ab22d6";

export default function App() {
  const [movies, setMovies] = useState([]);
  // const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched"); //Custom Hook for fetching and storing watched history in Local Storage.

  function handleSelectedMovie(id) {
    setSelectedMovieId((selectedMovieId) =>
      id === selectedMovieId ? null : id
    );
  }
  function handleCloseSelectedMovie() {
    setSelectedMovieId(null);
  }

  function handleAddWatchedMovies(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await axios.get(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal }
        );
        if (res.status !== 200) throw new Error("Failed to fetch movie!!!");

        if (res.data.Response === "False")
          throw new Error("Movie not found!!!");

        setMovies(res.data.Search);
        setError("");
      } catch (err) {
        if (err.name !== "CanceledError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    handleCloseSelectedMovie();
    fetchMovies();
    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar>
        <MovieSearch query={query} setQuery={setQuery} />
        <NumMovieSearchResult>
          <p className="num-results">
            Found <strong>{movies.length}</strong> results
          </p>
        </NumMovieSearchResult>
      </NavBar>
      <Main>
        {/* <Box>{isLoading ? <Loader /> : <MovieList movies={movies} />}</Box> */}
        {isLoading && <Loader />}
        {!isLoading && !error && (
          <MovieList
            movies={movies}
            selectedMovieId={selectedMovieId}
            handleSelectedMovie={handleSelectedMovie}
          />
        )}
        {error && <ErrorMessage errorMsg={error} />}
        <Box>
          {selectedMovieId ? (
            <SelectedMovieDetails
              selectedMovieId={selectedMovieId}
              handleCloseSelectedMovie={handleCloseSelectedMovie}
              handleAddWatchedMovies={handleAddWatchedMovies}
              watched={watched}
            />
          ) : (
            <>
              <WatchedMoviesSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                handleDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ errorMsg }) {
  return (
    <p className="error">
      <span>❌ </span>
      {errorMsg}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <LogoAppName />
      {children}
    </nav>
  );
}

function LogoAppName() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>allAboutMovies</h1>
    </div>
  );
}

function MovieSearch({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumMovieSearchResult({ children }) {
  return children;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function SelectedMovieDetails({
  selectedMovieId,
  handleCloseSelectedMovie,
  handleAddWatchedMovies,
  watched,
}) {
  const [movieDetails, setMovieData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched
    .map((movie) => movie.imdbID)
    .includes(selectedMovieId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedMovieId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedMovieId,
      title,
      year,
      imdbRating: Number(imdbRating),
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    handleAddWatchedMovies(newWatchedMovie);
    handleCloseSelectedMovie();
  }

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);

      const res = await axios.get(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovieId}`
      );
      setMovieData(res.data);
      setIsLoading(false);
    };
    fetchMovieDetails();
  }, [selectedMovieId]);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "allAboutMovies";
      };
    },
    [title]
  );

  useKey("Escape", handleCloseSelectedMovie);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <button
            className="btn-back"
            onClick={() => handleCloseSelectedMovie()}
          >
            &larr;
          </button>
          <header>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You rated with movie {watchedUserRating} ⭐</p>
              )}
            </div>
            <p>{plot}</p>
            <p>Starring : {actors}</p>
            <p>Directed by : {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMoviesSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating)
  ).toFixed(1);
  const avgUserRating = average(
    watched.map((movie) => movie.userRating)
  ).toFixed(1);
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, handleDeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovieDetails
          movie={movie}
          key={movie.imdbID}
          handleDeleteWatchedMovie={handleDeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovieDetails({ movie, handleDeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} loading="lazy" />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleDeleteWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
