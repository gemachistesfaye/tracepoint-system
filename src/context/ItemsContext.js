import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToItems } from "../firebase/firestore";

const ItemsContext = createContext(null);
export const useItems = () => useContext(ItemsContext);

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const lostItems = items.filter((i) => i.type === "lost");
  const foundItems = items.filter((i) => i.type === "found");
  const openItems = items.filter((i) => i.status === "open");
  const resolvedItems = items.filter((i) => i.status === "resolved");

  return (
    <ItemsContext.Provider value={{ items, lostItems, foundItems, openItems, resolvedItems, loading }}>
      {children}
    </ItemsContext.Provider>
  );
};
