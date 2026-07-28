import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getLostItemsPaginated, getFoundItemsPaginated } from "../firebase/firestore";

const ItemsContext = createContext(null);
export const useItems = () => useContext(ItemsContext);

export const ItemsProvider = ({ children }) => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreLost, setHasMoreLost] = useState(true);
  const [hasMoreFound, setHasMoreFound] = useState(true);
  const [lastLostDoc, setLastLostDoc] = useState(null);
  const [lastFoundDoc, setLastFoundDoc] = useState(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [lostResult, foundResult] = await Promise.all([
        getLostItemsPaginated(20),
        getFoundItemsPaginated(20),
      ]);
      setLostItems(lostResult.items);
      setFoundItems(foundResult.items);
      setLastLostDoc(lostResult.lastDoc);
      setLastFoundDoc(foundResult.lastDoc);
      setHasMoreLost(lostResult.hasMore);
      setHasMoreFound(foundResult.hasMore);
    } catch (error) {
      console.error("Error loading items:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMoreLost = useCallback(async () => {
    if (loadingMore || !hasMoreLost || !lastLostDoc) return;
    setLoadingMore(true);
    try {
      const result = await getLostItemsPaginated(20, lastLostDoc);
      setLostItems(prev => [...prev, ...result.items]);
      setLastLostDoc(result.lastDoc);
      setHasMoreLost(result.hasMore);
    } catch (error) {
      console.error("Error loading more lost items:", error);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMoreLost, lastLostDoc]);

  const loadMoreFound = useCallback(async () => {
    if (loadingMore || !hasMoreFound || !lastFoundDoc) return;
    setLoadingMore(true);
    try {
      const result = await getFoundItemsPaginated(20, lastFoundDoc);
      setFoundItems(prev => [...prev, ...result.items]);
      setLastFoundDoc(result.lastDoc);
      setHasMoreFound(result.hasMore);
    } catch (error) {
      console.error("Error loading more found items:", error);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMoreFound, lastFoundDoc]);

  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  const items = [...lostItems, ...foundItems].sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return db - da;
  });

  const openItems = items.filter((i) => i.status === "open");
  const resolvedItems = items.filter((i) => i.status === "resolved");

  return (
    <ItemsContext.Provider value={{
      items, lostItems, foundItems, openItems, resolvedItems,
      loading, loadingMore, hasMoreLost, hasMoreFound,
      loadMoreLost, loadMoreFound, refresh,
    }}>
      {children}
    </ItemsContext.Provider>
  );
};
