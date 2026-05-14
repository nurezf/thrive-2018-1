
//handle cart and prducts using custom hook by zustand
import { create } from "zustand";
import { Product } from "../admin/products/page";

interface ProductState {
  product: Product | null;
  loading: boolean;
  error: string | null;
  cart: Product[];
  setProduct: (product: Product) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCart: (cart: Product[]) => void;
  handleAddToCart: (product: Product) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  product: null,
  loading: true,
  error: null,
  cart: [],

  setProduct: (product: Product) => set({ product }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCart: (cart: Product[]) => set({ cart }),

  handleAddToCart: (product: Product) =>
    set((state) => ({
      cart: [...state.cart, product],
    })),
}));
