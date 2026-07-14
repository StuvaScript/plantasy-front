import { useCallback, useEffect, useState } from "react";
import api from "../lib/apiClient";
import PlantGrid from "../components/PlantGrid";
import Button from "../components/shared/Button";
import { useLocation, useNavigate } from "react-router-dom";
import SortButton from "../components/SortButton";

const searchPlants = async (searchName) => {
  const res = await api.get(`/identifyPlants?name=${searchName}`);
  const sortedData = res.data.sort((a, b) =>
    a.common_name.toLowerCase().localeCompare(b.common_name.toLowerCase())
  );
  return sortedData;
};

export default function ExplorerPage() {
  const location = useLocation();
  const { state } = location;

  const [plants, setPlants] = useState(
    (state?.linkedFrom === "details page" &&
      JSON.parse(sessionStorage.getItem("plants"))) ||
      []
  );
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (state?.linkedFrom !== "details page") {
      const fetchPlants = async (searchName) => {
        try {
          const response = await searchPlants(searchName);
          sessionStorage.setItem("plants", JSON.stringify(response));
          setPlants(response);
        } catch (error) {
          setError(error.message);
        }
      };

      fetchPlants("tree");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchName) {
      setError("Missing plant name");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await searchPlants(searchName);
      sessionStorage.setItem("plants", JSON.stringify(res));
      setPlants(res);
      setSearchName("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (imageURL, name) => {
    navigate("/identify", {
      state: { imageURL, name, mode: "manual" },
    });
  };

  const setAscendingOrder = useCallback(
    () =>
      setPlants((plants) =>
        [...plants].sort((a, b) =>
          a.common_name.toLowerCase().localeCompare(b.common_name.toLowerCase())
        )
      ),
    []
  );

  const setDescendingOrder = useCallback(
    () =>
      setPlants((plants) =>
        [...plants].sort((a, b) =>
          b.common_name.toLowerCase().localeCompare(a.common_name.toLowerCase())
        )
      ),
    []
  );

  useEffect(() => {
    isAscending ? setAscendingOrder() : setDescendingOrder();
  }, [isAscending]);

  const handleSort = () => {
    setIsAscending((value) => !value);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explorer Page
          </h1>
          <div className="max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-3">
              <label
                htmlFor="plant-search"
                className="block text-sm font-medium text-gray-700"
              >
                Search for plants
              </label>

              <input
                id="plant-search"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring focus:ring-green-300 focus:ring-opacity-50"
              />
              <div className="flex flex-inline-col gap-2">
                <Button type="submit" disabled={isLoading}>
                  Search
                </Button>
                <SortButton handleSort={handleSort} isAscending={isAscending} />
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold">Error loading plants</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {!isLoading && !error && (
          <PlantGrid
            plants={plants}
            linkedFrom="explorer page"
            onAdd={handleAdd}
          />
        )}
      </div>
    </main>
  );
}
