import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';

// Re-export types for convenience
export type Material = Tables<'materials'>;
export type Client = Tables<'clients'>;
export type Order = Tables<'orders'>;
export type Transaction = Tables<'transactions'>;
export type PricingConfig = Tables<'pricing_configs'>;
export type Product = Tables<'products'>;
export type ProductMaterial = Tables<'product_materials'>;
export type Profile = Tables<'profiles'>;

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface FixedCost {
  id: string;
  name: string;
  monthlyCost: number;
}

function useSupabaseTable<T extends { id: string }>(
  table: string,
  orderBy: string = 'created_at'
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setData([]); setLoading(false); return; }
    const { data: rows } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: false }) as any;
    setData((rows || []) as T[]);
    setLoading(false);
  }, [user, table, orderBy]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}

export function useMaterials() {
  const { user } = useAuth();
  const { data: materials, loading, refresh } = useSupabaseTable<Material>('materials');

  const add = async (m: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;
    await supabase.from('materials').insert({ ...m, user_id: user.id } as TablesInsert<'materials'>);
    refresh();
  };

  const update = async (m: Material) => {
    await supabase.from('materials').update({
      name: m.name, category: m.category, quantity: m.quantity, unit: m.unit,
      cost_per_unit: m.cost_per_unit, min_stock: m.min_stock, supplier: m.supplier,
      supplier_contact: m.supplier_contact, last_price: m.last_price,
    }).eq('id', m.id);
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('materials').delete().eq('id', id);
    refresh();
  };

  return { materials, loading, add, update, remove, refresh };
}

export function useClients() {
  const { user } = useAuth();
  const { data: clients, loading, refresh } = useSupabaseTable<Client>('clients');

  const add = async (c: { name: string; phone: string; email?: string; notes?: string }) => {
    if (!user) return;
    await supabase.from('clients').insert({ ...c, user_id: user.id });
    refresh();
  };

  const update = async (c: Client) => {
    await supabase.from('clients').update({
      name: c.name, phone: c.phone, email: c.email, notes: c.notes,
    }).eq('id', c.id);
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    refresh();
  };

  return { clients, loading, add, update, remove, refresh };
}

export function useOrders() {
  const { user } = useAuth();
  const { data: orders, loading, refresh } = useSupabaseTable<Order>('orders');

  const add = async (o: {
    client_id?: string | null; client_name: string; event_theme: string;
    delivery_date?: string | null; items: OrderItem[]; status: string;
    art_approved: boolean; art_notes?: string; personalization?: string; total: number;
  }) => {
    if (!user) return;
    await supabase.from('orders').insert({
      ...o,
      items: o.items as unknown as Json,
      user_id: user.id,
    });
    refresh();
  };

  const update = async (o: Order) => {
    await supabase.from('orders').update({
      client_name: o.client_name, event_theme: o.event_theme,
      delivery_date: o.delivery_date, items: o.items,
      status: o.status, art_approved: o.art_approved,
      art_notes: o.art_notes, personalization: o.personalization, total: o.total,
    }).eq('id', o.id);
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
    refresh();
  };

  return { orders, loading, add, update, remove, refresh };
}

export function useTransactions() {
  const { user } = useAuth();
  const { data: transactions, loading, refresh } = useSupabaseTable<Transaction>('transactions');

  const add = async (t: { type: string; description: string; amount: number; date: string; category: string; order_id?: string }) => {
    if (!user) return;
    await supabase.from('transactions').insert({ ...t, user_id: user.id });
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    refresh();
  };

  return { transactions, loading, add, remove, refresh };
}

export function usePricingConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setConfig(null); setLoading(false); return; }
    supabase.from('pricing_configs').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setConfig(data); setLoading(false); });
  }, [user]);

  const save = async (c: Partial<PricingConfig>) => {
    if (!user || !config) return;
    const { data } = await supabase.from('pricing_configs').update({
      desired_monthly_salary: c.desired_monthly_salary,
      monthly_work_hours: c.monthly_work_hours,
      fixed_costs: c.fixed_costs,
      default_margin: c.default_margin,
      default_tax_rate: c.default_tax_rate,
    }).eq('id', config.id).select().single();
    if (data) setConfig(data);
  };

  return { config, loading, save };
}

export function useProducts() {
  const { user } = useAuth();
  const { data: products, loading, refresh } = useSupabaseTable<Product>('products');

  const add = async (p: { name: string; description?: string; base_price: number; images?: string[] }) => {
    if (!user) return;
    await supabase.from('products').insert({
      name: p.name, description: p.description, base_price: p.base_price,
      images: (p.images || []) as unknown as Json, user_id: user.id,
    });
    refresh();
  };

  const update = async (p: Product) => {
    await supabase.from('products').update({
      name: p.name, description: p.description, base_price: p.base_price, images: p.images,
    }).eq('id', p.id);
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    refresh();
  };

  return { products, loading, add, update, remove, refresh };
}

export function useProductMaterials(productId: string | null) {
  const [materials, setMaterials] = useState<(ProductMaterial & { material_name?: string; unit?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!productId) { setMaterials([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('product_materials')
      .select('*, materials(name, unit)')
      .eq('product_id', productId);
    setMaterials((data || []).map((pm: any) => ({
      ...pm,
      material_name: pm.materials?.name,
      unit: pm.materials?.unit,
    })));
    setLoading(false);
  }, [productId]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (materialId: string, quantityUsed: number) => {
    if (!productId) return;
    await supabase.from('product_materials').insert({
      product_id: productId, material_id: materialId, quantity_used: quantityUsed,
    });
    refresh();
  };

  const remove = async (id: string) => {
    await supabase.from('product_materials').delete().eq('id', id);
    refresh();
  };

  return { materials, loading, add, remove, refresh };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return; }
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [user]);

  const save = async (p: Partial<Profile>) => {
    if (!user || !profile) return;
    const { data } = await supabase.from('profiles').update({
      company_name: p.company_name, company_phone: p.company_phone, company_logo_url: p.company_logo_url,
    }).eq('id', profile.id).select().single();
    if (data) setProfile(data);
  };

  return { profile, loading, save };
}
