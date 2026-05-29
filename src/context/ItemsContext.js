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

  return (
    <ItemsContext.Provider value={{ items, lostItems, foundItems, loading }}>
      {children}
    </ItemsContext.Provider>
  );
};
