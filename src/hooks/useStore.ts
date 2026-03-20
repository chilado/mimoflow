import { useState, useCallback } from 'react';
import { store, type Material, type Client, type Order, type Transaction, type PricingConfig, generateId } from '@/lib/store';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>(store.getMaterials());
  const refresh = useCallback(() => setMaterials(store.getMaterials()), []);
  return {
    materials,
    refresh,
    add: (m: Omit<Material, 'id'>) => { store.addMaterial({ ...m, id: generateId() }); refresh(); },
    update: (m: Material) => { store.updateMaterial(m); refresh(); },
    remove: (id: string) => { store.deleteMaterial(id); refresh(); },
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>(store.getClients());
  const refresh = useCallback(() => setClients(store.getClients()), []);
  return {
    clients,
    refresh,
    add: (c: Omit<Client, 'id' | 'createdAt'>) => { store.addClient({ ...c, id: generateId(), createdAt: new Date().toISOString() }); refresh(); },
    update: (c: Client) => { store.updateClient(c); refresh(); },
    remove: (id: string) => { store.deleteClient(id); refresh(); },
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const refresh = useCallback(() => setOrders(store.getOrders()), []);
  return {
    orders,
    refresh,
    add: (o: Omit<Order, 'id' | 'createdAt'>) => { store.addOrder({ ...o, id: generateId(), createdAt: new Date().toISOString() }); refresh(); },
    update: (o: Order) => { store.updateOrder(o); refresh(); },
    remove: (id: string) => { store.deleteOrder(id); refresh(); },
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(store.getTransactions());
  const refresh = useCallback(() => setTransactions(store.getTransactions()), []);
  return {
    transactions,
    refresh,
    add: (t: Omit<Transaction, 'id'>) => { store.addTransaction({ ...t, id: generateId() }); refresh(); },
    remove: (id: string) => { store.deleteTransaction(id); refresh(); },
  };
}

export function usePricingConfig() {
  const [config, setConfig] = useState<PricingConfig>(store.getPricingConfig());
  const save = (c: PricingConfig) => { store.savePricingConfig(c); setConfig(c); };
  return { config, save };
}
