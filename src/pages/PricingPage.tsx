import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePricingConfig } from '@/hooks/useStore';
import { formatCurrency, generateId } from '@/lib/store';

interface MaterialCost {
  id: string;
  name: string;
  packageQty: number;
  packagePrice: number;
  usedQty: number;
}

export default function PricingPage() {
  const { config, save } = usePricingConfig();

  // Product pricing form
  const [productName, setProductName] = useState('');
  const [materials, setMaterials] = useState<MaterialCost[]>([]);
  const [productionMinutes, setProductionMinutes] = useState(30);
  const [margin, setMargin] = useState(config.defaultMargin);
  const [taxRate, setTaxRate] = useState(config.defaultTaxRate);
  const [quantity, setQuantity] = useState(1);

  const hourlyRate = config.monthlyWorkHours > 0
    ? config.desiredMonthlySalary / config.monthlyWorkHours
    : 0;

  const totalFixedCosts = config.fixedCosts.reduce((s, c) => s + c.monthlyCost, 0);
  const fixedCostPerHour = config.monthlyWorkHours > 0 ? totalFixedCosts / config.monthlyWorkHours : 0;

  // Calculations
  const materialsCost = materials.reduce((sum, m) => {
    const costPerUnit = m.packageQty > 0 ? m.packagePrice / m.packageQty : 0;
    return sum + costPerUnit * m.usedQty;
  }, 0);

  const laborCost = (productionMinutes / 60) * hourlyRate;
  const fixedCostAlloc = (productionMinutes / 60) * fixedCostPerHour;
  const baseCost = materialsCost + laborCost + fixedCostAlloc;
  const markupMultiplier = 1 + margin / 100;
  const priceBeforeTax = baseCost * markupMultiplier;
  const taxAmount = priceBeforeTax * (taxRate / 100);
  const finalPrice = priceBeforeTax + taxAmount;
  const profit = finalPrice - baseCost - taxAmount;

  const addMaterial = () => setMaterials(prev => [...prev, { id: generateId(), name: '', packageQty: 1, packagePrice: 0, usedQty: 1 }]);
  const removeMaterial = (id: string) => setMaterials(prev => prev.filter(m => m.id !== id));
  const updateMaterial = (id: string, field: keyof MaterialCost, value: string | number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addFixedCost = () => save({ ...config, fixedCosts: [...config.fixedCosts, { id: generateId(), name: '', monthlyCost: 0 }] });
  const removeFixedCost = (id: string) => save({ ...config, fixedCosts: config.fixedCosts.filter(c => c.id !== id) });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="animate-fade-up">
        <h1 className="font-heading text-2xl font-bold">Precificação Inteligente</h1>
        <p className="text-muted-foreground text-sm mt-1">Calcule o preço ideal dos seus produtos</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Config */}
        <Card className="animate-fade-up stagger-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Salário Desejado/Mês</Label>
                <Input type="number" value={config.desiredMonthlySalary} onChange={e => save({ ...config, desiredMonthlySalary: +e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Horas/Mês de Trabalho</Label>
                <Input type="number" value={config.monthlyWorkHours} onChange={e => save({ ...config, monthlyWorkHours: +e.target.value })} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Valor da sua hora: <strong className="text-foreground">{formatCurrency(hourlyRate)}</strong>
            </div>

            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Custos Fixos Mensais</Label>
                <Button variant="ghost" size="sm" onClick={addFixedCost}><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
              </div>
              {config.fixedCosts.map(c => (
                <div key={c.id} className="flex gap-2 mb-2">
                  <Input placeholder="Nome" value={c.name} className="text-sm" onChange={e => save({ ...config, fixedCosts: config.fixedCosts.map(x => x.id === c.id ? { ...x, name: e.target.value } : x) })} />
                  <Input type="number" placeholder="R$" value={c.monthlyCost || ''} className="w-28 text-sm" onChange={e => save({ ...config, fixedCosts: config.fixedCosts.map(x => x.id === c.id ? { ...x, monthlyCost: +e.target.value } : x) })} />
                  <Button variant="ghost" size="icon" onClick={() => removeFixedCost(c.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              {config.fixedCosts.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Total: {formatCurrency(totalFixedCosts)}/mês — {formatCurrency(fixedCostPerHour)}/hora</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="animate-fade-up stagger-2 border-primary/20 bg-primary/[0.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Custo de Materiais</span><span>{formatCurrency(materialsCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mão de Obra ({productionMinutes}min)</span><span>{formatCurrency(laborCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Custos Fixos (rateio)</span><span>{formatCurrency(fixedCostAlloc)}</span></div>
              <Separator />
              <div className="flex justify-between font-medium"><span>Custo Total</span><span>{formatCurrency(baseCost)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Margem de Lucro ({margin}%)</span><span>+{formatCurrency(baseCost * margin / 100)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Impostos/Taxas ({taxRate}%)</span><span>+{formatCurrency(taxAmount)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Preço de Venda</span>
                <span>{formatCurrency(finalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-success">
                <span>Lucro Líquido</span>
                <span>{formatCurrency(profit)}</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                  <span>Total ({quantity} unid.)</span>
                  <span>{formatCurrency(finalPrice * quantity)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product calc */}
      <Card className="animate-fade-up stagger-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calcular Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs">Nome do Produto</Label>
              <Input value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ex: Kit Festa Safari" />
            </div>
            <div>
              <Label className="text-xs">Tempo Produção (min)</Label>
              <Input type="number" value={productionMinutes} onChange={e => setProductionMinutes(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Quantidade</Label>
              <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Margem de Lucro (%)</Label>
              <Input type="number" value={margin} onChange={e => setMargin(+e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Impostos / Taxas de Cartão (%)</Label>
              <Input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} />
            </div>
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Materiais Utilizados</Label>
            <Button variant="outline" size="sm" onClick={addMaterial}><Plus className="h-3 w-3 mr-1" /> Material</Button>
          </div>

          {materials.map(m => (
            <div key={m.id} className="grid grid-cols-[1fr_80px_80px_80px_32px] gap-2 items-end">
              <div>
                <Label className="text-[11px] text-muted-foreground">Material</Label>
                <Input className="text-sm" value={m.name} onChange={e => updateMaterial(m.id, 'name', e.target.value)} placeholder="Papel kraft" />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Qtd Pacote</Label>
                <Input className="text-sm" type="number" value={m.packageQty || ''} onChange={e => updateMaterial(m.id, 'packageQty', +e.target.value)} />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">R$ Pacote</Label>
                <Input className="text-sm" type="number" value={m.packagePrice || ''} onChange={e => updateMaterial(m.id, 'packagePrice', +e.target.value)} />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Qtd Usada</Label>
                <Input className="text-sm" type="number" value={m.usedQty || ''} onChange={e => updateMaterial(m.id, 'usedQty', +e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" className="h-9" onClick={() => removeMaterial(m.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
          {materials.length === 0 && <p className="text-sm text-muted-foreground">Adicione materiais para calcular o custo.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
