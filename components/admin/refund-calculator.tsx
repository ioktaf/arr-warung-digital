"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDays(value: number) {
  return `${new Intl.NumberFormat("id-ID").format(value)} hari`;
}

export function RefundCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("59000");
  const [totalDays, setTotalDays] = useState("30");
  const [usedDays, setUsedDays] = useState("0");
  const [adminFee, setAdminFee] = useState("0");

  const purchasePriceValue = Math.max(0, parseNumber(purchasePrice));
  const totalDaysValue = Math.max(1, Math.floor(parseNumber(totalDays) || 30));
  const usedDaysValue = Math.max(0, Math.floor(parseNumber(usedDays)));
  const adminFeeValue = Math.max(0, parseNumber(adminFee));
  const dailyRate = purchasePriceValue / totalDaysValue;
  const clampedUsedDays = Math.min(usedDaysValue, totalDaysValue);
  const remainingDays = Math.max(0, totalDaysValue - clampedUsedDays);
  const usedValue = dailyRate * clampedUsedDays;
  const grossRefund = Math.max(0, purchasePriceValue - usedValue);
  const finalRefund = Math.max(0, grossRefund - adminFeeValue);

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-muted">
          Refund Calculator
        </p>
        <h3 className="mt-2 text-2xl font-black">Hitung refund prorata dengan cepat</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Tool internal ini cocok untuk kasus akun sharing atau langganan yang
          dipakai sebagian lalu perlu dihitung sisa nilai refund-nya.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Harga beli awal
          <input
            type="number"
            inputMode="numeric"
            value={purchasePrice}
            onChange={(event) => setPurchasePrice(event.target.value)}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Total durasi langganan
          <input
            type="number"
            inputMode="numeric"
            value={totalDays}
            onChange={(event) => setTotalDays(event.target.value)}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Durasi yang sudah dipakai
          <input
            type="number"
            inputMode="numeric"
            value={usedDays}
            onChange={(event) => setUsedDays(event.target.value)}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Potongan admin / biaya penalty
          <input
            type="number"
            inputMode="numeric"
            value={adminFee}
            onChange={(event) => setAdminFee(event.target.value)}
            className="rounded-2xl border border-line bg-white/75 px-4 py-3 outline-none transition focus:border-brand"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-line bg-white/65 p-4">
          <p className="text-sm text-muted">Biaya per hari</p>
          <p className="mt-2 text-2xl font-black">{formatCurrency(dailyRate)}</p>
        </div>

        <div className="rounded-[24px] border border-line bg-white/65 p-4">
          <p className="text-sm text-muted">Sisa durasi</p>
          <p className="mt-2 text-2xl font-black">{formatDays(remainingDays)}</p>
        </div>

        <div className="rounded-[24px] border border-line bg-white/65 p-4">
          <p className="text-sm text-muted">Refund kotor</p>
          <p className="mt-2 text-2xl font-black">{formatCurrency(grossRefund)}</p>
        </div>

        <div className="rounded-[24px] border border-brand/20 bg-brand/10 p-4">
          <p className="text-sm text-muted">Refund final</p>
          <p className="mt-2 text-2xl font-black text-brand">
            {formatCurrency(finalRefund)}
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-line bg-white/60 p-5 text-sm leading-7 text-muted">
        Rumus yang dipakai: harga awal dibagi total hari untuk dapat biaya per
        hari, lalu nilai yang sudah terpakai dipotong dari harga awal. Hasil
        refund kotor kemudian dikurangi potongan admin bila ada.
      </div>
    </Card>
  );
}
